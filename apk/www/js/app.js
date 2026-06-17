/* ============================================================
   PAN EXPRESS — App principal (app.js)
   Router por hash, layout (cliente vs admin), login y alarmas.
   ============================================================ */

(() => {
  const { el, toast } = Utils;
  const app = () => document.getElementById('app');

  // Rutas del panel admin
  const NAV = [
    { id: 'dashboard',    label: 'Dashboard',     icono: '📊', render: Views.dashboard },
    { id: 'pedidos',      label: 'Pedidos',       icono: '🧾', render: Views.pedidos },
    { id: 'clientes',     label: 'Clientes',      icono: '👥', render: Views.clientes },
    { id: 'repartidores', label: 'Repartidores',  icono: '🛵', render: Views.repartidores },
    { id: 'insumos',      label: 'Insumos',       icono: '🌾', render: Views.insumos },
    { id: 'gastos',       label: 'Gastos',        icono: '💸', render: Views.gastos },
    { id: 'finanzas',     label: 'Finanzas',      icono: '💰', render: Views.finanzas },
    { id: 'reportes',     label: 'Reportes',      icono: '📑', render: Views.reportes },
    { id: 'alertas',      label: 'Alertas',       icono: '🔔', render: Views.centroAlertas },
    { id: 'whatsapp',     label: 'WhatsApp',      icono: '💬', render: Views.whatsapp },
  ];

  let logueado = false;

  function ruta() { return location.hash.replace('#', '') || 'inicio'; }

  function render() {
    const r = ruta();
    app().innerHTML = '';

    if (r === 'inicio') return renderInicio();
    if (r === 'cliente') return renderCliente();
    if (r.startsWith('admin')) return renderAdmin(r.split('/')[1] || 'dashboard');
    location.hash = 'inicio';
  }

  /* ---------- Pantalla de inicio: elegir rol ---------- */
  function renderInicio() {
    app().appendChild(el('div', { class: 'inicio' }, [
      el('div', { class: 'inicio-logo' }, '🥖'),
      el('h1', {}, 'PAN EXPRESS'),
      el('p', { class: 'inicio-sub' }, 'Pedido de pan a domicilio · Ventas · Administración'),
      el('div', { class: 'inicio-cards' }, [
        el('div', { class: 'rol-card', onclick: () => location.hash = 'cliente' }, [
          el('div', { class: 'rol-ico' }, '🛒'),
          el('h2', {}, 'Soy Cliente'),
          el('p', {}, 'Hacer un pedido de pan'),
        ]),
        el('div', { class: 'rol-card', onclick: () => location.hash = 'admin' }, [
          el('div', { class: 'rol-ico' }, '🔐'),
          el('h2', {}, 'Administrador'),
          el('p', {}, 'Panel de gestión del negocio'),
        ]),
      ]),
      el('button', { class: 'link-reset', onclick: resetDemo }, 'Reiniciar datos de demostración'),
      el('p', { class: 'inicio-pie' }, 'Prototipo funcional · Datos guardados en este dispositivo'),
    ]));
  }

  /* ---------- Layout cliente ---------- */
  function renderCliente() {
    app().appendChild(el('div', { class: 'topbar' }, [
      el('button', { class: 'btn-back', onclick: () => location.hash = 'inicio' }, '← Inicio'),
      el('strong', {}, 'Pan Express · Cliente'),
      el('button', { class: 'btn-back', onclick: () => location.hash = 'admin' }, 'Admin →'),
    ]));
    app().appendChild(Views.cliente());
  }

  /* ---------- Login + layout admin ---------- */
  function renderAdmin(seccion) {
    if (!logueado) return renderLogin();

    const layout = el('div', { class: 'admin-layout' });

    // Sidebar
    const nav = el('nav', { class: 'sidebar' }, [
      el('div', { class: 'side-logo' }, [el('span', {}, '🥖'), el('strong', {}, 'PAN EXPRESS')]),
    ]);
    NAV.forEach(n => {
      const badge = n.id === 'alertas' ? Utils.alertas().length : null;
      nav.appendChild(el('a', {
        class: 'side-link' + (n.id === seccion ? ' activo' : ''),
        href: '#admin/' + n.id,
      }, [
        el('span', { class: 'side-ico' }, n.icono),
        el('span', {}, n.label),
        badge ? el('span', { class: 'side-badge' }, String(badge)) : null,
      ]));
    });
    nav.appendChild(el('div', { class: 'side-foot' }, [
      el('button', { class: 'side-link', onclick: toggleSonido, id: 'btn-sonido' }, '🔕 Activar sonido'),
      el('a', { class: 'side-link', href: '#cliente' }, [el('span', { class: 'side-ico' }, '🛒'), el('span', {}, 'Vista cliente')]),
      el('button', { class: 'side-link', onclick: () => { logueado = false; location.hash = 'inicio'; } }, [el('span', { class: 'side-ico' }, '🚪'), el('span', {}, 'Salir')]),
    ]));
    layout.appendChild(nav);

    // Contenido
    const main = el('main', { class: 'admin-main' });
    const def = NAV.find(n => n.id === seccion) || NAV[0];
    main.appendChild(def.render());
    layout.appendChild(main);

    app().appendChild(layout);
  }

  function renderLogin() {
    const u = el('input', { class: 'inp', placeholder: 'Usuario', value: 'admin' });
    const p = el('input', { class: 'inp', type: 'password', placeholder: 'Contraseña', value: '' });
    function entrar() {
      // Demo: usuario admin / clave 1234
      if (u.value.trim() === 'admin' && p.value === '1234') {
        logueado = true; render();
        toast('Bienvenido, Administrador', 'ok');
      } else {
        toast('Usuario o contraseña incorrectos (admin / 1234)', 'error');
      }
    }
    p.addEventListener('keydown', e => { if (e.key === 'Enter') entrar(); });
    app().appendChild(el('div', { class: 'login' }, [
      el('div', { class: 'login-box' }, [
        el('div', { class: 'inicio-logo' }, '🔐'),
        el('h1', {}, 'Panel Administrador'),
        el('p', { class: 'muted' }, 'Acceso protegido'),
        u, p,
        el('button', { class: 'btn-primary btn-block', onclick: entrar }, 'Ingresar'),
        el('p', { class: 'login-hint' }, 'Demo: usuario <strong>admin</strong> · clave <strong>1234</strong>', ),
        el('button', { class: 'btn-back', onclick: () => location.hash = 'inicio' }, '← Volver'),
      ]),
    ]));
  }

  /* ---------- Sonido / alarmas ---------- */
  function toggleSonido() {
    window.__panexpress_sonido = !window.__panexpress_sonido;
    const btn = document.getElementById('btn-sonido');
    if (btn) btn.textContent = window.__panexpress_sonido ? '🔔 Sonido activado' : '🔕 Activar sonido';
    if (window.__panexpress_sonido) { Utils.sonarAlerta('ok'); toast('Alarmas sonoras activadas', 'ok'); }
  }

  function resetDemo() {
    Store.reset();
    toast('Datos reiniciados', 'ok');
    render();
  }

  /* ---------- Vigilancia de alertas (notificaciones automáticas) ---------- */
  let alertasPrevias = 0;
  function vigilar() {
    const n = Utils.alertas().length;
    if (n > alertasPrevias && alertasPrevias !== 0) {
      // apareció una alerta nueva
    }
    alertasPrevias = n;
  }

  /* ---------- Init ---------- */
  window.addEventListener('hashchange', render);
  document.addEventListener('db:change', () => {
    // re-render del admin para reflejar cambios en vivo
    if (logueado && ruta().startsWith('admin')) {
      const sec = ruta().split('/')[1] || 'dashboard';
      // La vista de WhatsApp gestiona su propio chat: no la reconstruimos en vivo.
      if (sec === 'whatsapp') { vigilar(); return; }
      const main = document.querySelector('.admin-main');
      if (main) { main.innerHTML = ''; const def = NAV.find(n => n.id === sec) || NAV[0]; main.appendChild(def.render()); }
      // actualizar badges del sidebar
      document.querySelectorAll('.side-link').forEach(() => {});
    }
    vigilar();
  });

  render();

  // Cuando el servidor/base de datos responde con los datos reales, refrescar.
  if (window.Store && Store.ready && typeof Store.ready.then === 'function') {
    Store.ready.then((info) => {
      render();
      if (info && info.servidor) console.log('Pan Express: conectado a la base de datos.');
    });
  }
})();
