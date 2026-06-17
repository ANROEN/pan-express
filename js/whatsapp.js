/* ============================================================
   PAN EXPRESS — Intérprete de pedidos por WhatsApp (whatsapp.js)
   Convierte un mensaje en lenguaje natural a un pedido estructurado.
   Ej: "Hola, quiero 3 kilos de marraqueta para las 18:00"
   En producción esto lo alimentaría WhatsApp Business API.
   ============================================================ */

window.WhatsAppNLP = (() => {

  // Palabras numéricas a número
  const PALABRAS_NUM = {
    un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, medio: 0.5, 'media': 0.5,
  };

  // Sinónimos -> id de producto del catálogo
  const ALIAS = {
    marraqueta: 'marraqueta', marraquetas: 'marraqueta', pancito: 'marraqueta',
    hallulla: 'hallulla', hallullas: 'hallulla', allulla: 'hallulla',
    amasado: 'amasado', amasada: 'amasado', 'pan amasado': 'amasado',
    integral: 'integral', 'pan integral': 'integral',
    especial: 'especial', especiales: 'especial',
  };

  function parsearCantidad(token) {
    if (PALABRAS_NUM[token] !== undefined) return PALABRAS_NUM[token];
    const n = parseFloat(token.replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  // Devuelve { items:[{productoId,kilos}], hora, telefono, crudo, reconocido }
  function interpretar(texto) {
    const t = ' ' + texto.toLowerCase().replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/g, 'o').replace(/[úù]/g, 'u') + ' ';
    const items = [];

    // Recorre cada producto del catálogo buscando "<cantidad> ... <producto>"
    for (const [alias, prodId] of Object.entries(ALIAS)) {
      const idx = t.indexOf(alias);
      if (idx === -1) continue;
      if (items.some(i => i.productoId === prodId)) continue;

      // mira las ~6 palabras antes del producto buscando una cantidad
      const antes = t.slice(Math.max(0, idx - 40), idx).trim().split(/\s+/);
      let kilos = null;
      for (let k = antes.length - 1; k >= 0; k--) {
        const c = parsearCantidad(antes[k]);
        if (c !== null) { kilos = c; break; }
      }
      items.push({ productoId: prodId, kilos: kilos || 1 });
    }

    // Hora "para las 18:00" / "18 hrs" / "a las 6"
    let hora = '';
    const mHora = t.match(/(\d{1,2})[:\.](\d{2})/) || t.match(/las?\s+(\d{1,2})\s*(?:hrs?|horas?|h)?/);
    if (mHora) {
      const hh = String(mHora[1]).padStart(2, '0');
      const mm = mHora[2] ? mHora[2] : '00';
      hora = `${hh}:${mm}`;
    }

    // Teléfono
    const mTel = texto.match(/\+?\d[\d\s]{7,}/);
    const telefono = mTel ? mTel[0].replace(/\s/g, '') : '';

    return {
      crudo: texto,
      items,
      hora,
      telefono,
      reconocido: items.length > 0,
    };
  }

  // Respuesta automática que enviaría el bot al cliente
  function respuestaBot(parse, pedido) {
    if (!parse.reconocido) {
      return '🤖 No entendí bien tu pedido. Escribe por ejemplo: "Quiero 2 kilos de marraqueta para las 18:00".';
    }
    const detalle = pedido.items.map(it => {
      const p = Store.productoById(it.productoId);
      return `• ${it.kilos} kg de ${p.nombre} — ${Utils.clp(p.precio * it.kilos)}`;
    }).join('\n');
    return `✅ ¡Pedido recibido! N° ${String(pedido.id).padStart(3, '0')}\n${detalle}\n*Total: ${Utils.clp(pedido.total)}*` +
      (pedido.hora ? `\n🕖 Para las ${pedido.hora}` : '') +
      `\nTe avisaremos cuando esté en reparto. ¡Gracias! 🥖`;
  }

  return { interpretar, respuestaBot };
})();
