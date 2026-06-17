/* ============================================================
   PAN EXPRESS — Utilidades comunes (utils.js)
   Formato de dinero, fechas, helpers de DOM, y sistema de
   notificaciones / alarmas estilo app.
   ============================================================ */

window.Utils = (() => {

  /* ---------- Formato ---------- */
  const clp = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');

  const HOY = '2026-06-16';

  function diasEntre(fechaA, fechaB) {
    const a = new Date(fechaA), b = new Date(fechaB);
    return Math.round((b - a) / 86400000);
  }

  function nombreEstado(e) {
    return {
      recibido: 'Pedido recibido',
      preparacion: 'En preparación',
      reparto: 'En reparto',
      entregado: 'Entregado',
    }[e] || e;
  }

  function colorEstado(e) {
    return { recibido: 'azul', preparacion: 'amarillo', reparto: 'naranja', entregado: 'verde' }[e] || 'gris';
  }

  /* ---------- DOM helpers ---------- */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ---------- Notificaciones emergentes (toasts) ---------- */
  function toast(mensaje, tipo = 'info', ms = 4000) {
    let cont = document.getElementById('toast-cont');
    if (!cont) {
      cont = el('div', { id: 'toast-cont', class: 'toast-cont' });
      document.body.appendChild(cont);
    }
    const icono = { info: '🔔', ok: '✅', warn: '⚠️', error: '🔴', pedido: '🛒' }[tipo] || '🔔';
    const t = el('div', { class: `toast toast-${tipo}` }, [
      el('span', { class: 'toast-ico' }, icono),
      el('span', { class: 'toast-msg', html: mensaje }),
    ]);
    cont.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    sonarAlerta(tipo);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
  }

  /* ---------- Alarma sonora (WebAudio, sin archivos) ---------- */
  let audioCtx = null;
  function sonarAlerta(tipo = 'info') {
    if (!window.__panexpress_sonido) return; // silencio por defecto hasta que el usuario active
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      const freq = { error: 660, warn: 520, pedido: 880, ok: 740 }[tipo] || 600;
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      o.start(); o.stop(audioCtx.currentTime + 0.36);
    } catch (e) { /* navegador sin audio */ }
  }

  /* ---------- Generador de alertas del negocio ---------- */
  // Recorre la base y devuelve la lista de alertas activas.
  function alertas() {
    const a = [];
    const db = Store.get();

    // Pedidos pendientes
    db.pedidos.filter(p => p.estado === 'recibido' || p.estado === 'preparacion')
      .forEach(p => a.push({ nivel: 'rojo', icono: '🔴', tipo: 'Pedido pendiente', texto: `Pedido #${String(p.id).padStart(3, '0')} sin despachar` }));

    // Repartidor con pedido en reparto pasada la hora (demo simple)
    db.pedidos.filter(p => p.estado === 'reparto').forEach(p => {
      a.push({ nivel: 'amarillo', icono: '🟡', tipo: 'En reparto', texto: `Pedido #${String(p.id).padStart(3, '0')} en camino` });
    });

    // Insumos bajo el mínimo
    db.insumos.filter(i => i.stock <= i.minimo).forEach(i => {
      a.push({ nivel: 'rojo', icono: '🔔', tipo: 'Stock bajo', texto: `Quedan ${i.stock} ${i.unidad} de ${i.nombre} (mínimo ${i.minimo})` });
    });

    // Insumos por vencer
    db.insumos.filter(i => i.vence && diasEntre(HOY, i.vence) <= 30 && diasEntre(HOY, i.vence) >= 0).forEach(i => {
      a.push({ nivel: 'amarillo', icono: '⚠️', tipo: 'Por vencer', texto: `${i.nombre} vence en ${diasEntre(HOY, i.vence)} días` });
    });

    // Vehículos que requieren mantención
    db.vehiculos.forEach(v => {
      if (v.proxAceite && diasEntre(HOY, v.proxAceite) <= 5) {
        a.push({ nivel: 'amarillo', icono: '🔧', tipo: 'Mantención', texto: `${v.nombre} requiere cambio de aceite (${v.proxAceite})` });
      }
      if (v.neumaticos === 'Revisar') {
        a.push({ nivel: 'amarillo', icono: '🔧', tipo: 'Mantención', texto: `${v.nombre}: revisar neumáticos` });
      }
    });

    // Cliente frecuente sin comprar hace 15+ días
    db.clientes.forEach(c => {
      const d = diasEntre(c.ultimaCompra, HOY);
      if (d >= 15) a.push({ nivel: 'azul', icono: '💤', tipo: 'Cliente inactivo', texto: `${c.nombre} no compra hace ${d} días` });
    });

    return a;
  }

  return { clp, HOY, diasEntre, nombreEstado, colorEstado, el, toast, sonarAlerta, alertas };
})();
