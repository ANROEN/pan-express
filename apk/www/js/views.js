/* ============================================================
   PAN EXPRESS — Vistas (views.js)
   Cada función devuelve un nodo del DOM para una pantalla.
   ============================================================ */

window.Views = (() => {
  const { el, clp, toast } = Utils;

  /* ===========================================================
     MÓDULO CLIENTE — Hacer un pedido
     =========================================================== */
  function cliente() {
    const carrito = {}; // productoId -> kilos

    const wrap = el('div', { class: 'cliente-wrap' });

    wrap.appendChild(el('header', { class: 'cliente-hero' }, [
      el('div', { class: 'logo-big' }, '🥖'),
      el('h1', {}, 'PAN EXPRESS'),
      el('p', {}, 'Pan fresco a tu puerta — haz tu pedido en segundos'),
    ]));

    // Catálogo
    const grid = el('div', { class: 'producto-grid' });
    Store.productos().filter(p => p.activo).forEach(p => {
      const qtyLabel = el('span', { class: 'qty' }, '0 kg');
      const card = el('div', { class: 'producto-card' }, [
        el('div', { class: 'producto-emoji' }, p.emoji),
        el('h3', {}, p.nombre),
        el('div', { class: 'producto-precio' }, `${clp(p.precio)} / kilo`),
        el('div', { class: 'qty-ctrl' }, [
          el('button', { class: 'qbtn', onclick: () => cambia(p.id, -0.5) }, '−'),
          qtyLabel,
          el('button', { class: 'qbtn', onclick: () => cambia(p.id, +0.5) }, '+'),
        ]),
      ]);
      card._qty = qtyLabel;
      card._id = p.id;
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    function cambia(id, delta) {
      carrito[id] = Math.max(0, (carrito[id] || 0) + delta);
      if (carrito[id] === 0) delete carrito[id];
      const card = [...grid.children].find(c => c._id === id);
      if (card) card._qty.textContent = (carrito[id] || 0) + ' kg';
      pintarResumen();
    }

    // Formulario de datos + resumen
    const resumen = el('div', { class: 'resumen-box' });
    const inNombre = el('input', { class: 'inp', placeholder: 'Tu nombre' });
    const inTel = el('input', { class: 'inp', placeholder: 'Teléfono (+569...)' });
    const inDir = el('input', { class: 'inp', placeholder: 'Dirección de entrega' });
    const inHora = el('input', { class: 'inp', type: 'time' });
    const selPago = el('select', { class: 'inp' }, [
      el('option', { value: 'efectivo' }, 'Efectivo'),
      el('option', { value: 'transferencia' }, 'Transferencia'),
      el('option', { value: 'tarjeta' }, 'Tarjeta'),
      el('option', { value: 'online' }, 'Pago online'),
    ]);

    const totalLbl = el('div', { class: 'resumen-total' }, 'Total: $0');
    const detalle = el('div', { class: 'resumen-detalle' });

    function pintarResumen() {
      detalle.innerHTML = '';
      let total = 0;
      Object.entries(carrito).forEach(([id, kilos]) => {
        const p = Store.productoById(id);
        const sub = p.precio * kilos;
        total += sub;
        detalle.appendChild(el('div', { class: 'res-row' }, [
          el('span', {}, `${p.emoji} ${kilos} kg ${p.nombre}`),
          el('strong', {}, clp(sub)),
        ]));
      });
      if (total === 0) detalle.appendChild(el('div', { class: 'res-empty' }, 'Aún no has elegido productos'));
      totalLbl.textContent = 'Total: ' + clp(total);
    }
    pintarResumen();

    const btn = el('button', { class: 'btn-pedir' }, '🛒 Confirmar pedido');
    btn.addEventListener('click', () => {
      const items = Object.entries(carrito).map(([productoId, kilos]) => ({ productoId, kilos }));
      if (items.length === 0) return toast('Elige al menos un producto', 'warn');
      if (!inTel.value.trim()) return toast('Ingresa tu teléfono', 'warn');

      const c = Store.upsertCliente({ nombre: inNombre.value.trim(), telefono: inTel.value.trim(), direccion: inDir.value.trim() });
      const pedido = Store.crearPedido({ clienteId: c.id, items, metodoPago: selPago.value, hora: inHora.value });
      toast(`✅ Pedido #${String(pedido.id).padStart(3, '0')} confirmado por ${clp(pedido.total)}`, 'ok', 5000);
      // reinicia
      Object.keys(carrito).forEach(k => delete carrito[k]);
      [...grid.children].forEach(card => card._qty.textContent = '0 kg');
      inNombre.value = inDir.value = inHora.value = ''; inTel.value = '';
      pintarResumen();
      mostrarSeguimiento(wrap, pedido.id);
    });

    resumen.appendChild(el('h2', {}, 'Tu pedido'));
    resumen.appendChild(detalle);
    resumen.appendChild(totalLbl);
    resumen.appendChild(el('div', { class: 'form-grid' }, [inNombre, inTel, inDir, inHora, selPago]));
    resumen.appendChild(btn);
    resumen.appendChild(el('p', { class: 'pago-nota' }, 'También puedes pedir por WhatsApp o desde el panel de administración.'));
    wrap.appendChild(resumen);

    return wrap;
  }

  // Barra de seguimiento de estado del pedido (cliente)
  function mostrarSeguimiento(wrap, pedidoId) {
    const old = wrap.querySelector('.seguimiento'); if (old) old.remove();
    const pasos = Store.ESTADOS;
    const seg = el('div', { class: 'seguimiento' });
    seg.appendChild(el('h3', {}, `Seguimiento pedido #${String(pedidoId).padStart(3, '0')}`));
    const barra = el('div', { class: 'seg-barra' });
    function pintar() {
      const p = Store.pedidos().find(x => x.id === pedidoId);
      barra.innerHTML = '';
      const idx = pasos.indexOf(p.estado);
      pasos.forEach((e, i) => {
        barra.appendChild(el('div', { class: 'seg-paso ' + (i <= idx ? 'activo' : '') }, [
          el('div', { class: 'seg-dot' }, i <= idx ? '✓' : (i + 1)),
          el('span', {}, Utils.nombreEstado(e)),
        ]));
      });
    }
    pintar();
    document.addEventListener('db:change', pintar);
    seg.appendChild(barra);
    seg.appendChild(el('p', { class: 'seg-nota' }, 'Recibirás notificaciones automáticas en cada etapa.'));
    wrap.insertBefore(seg, wrap.querySelector('.producto-grid'));
    seg.scrollIntoView({ behavior: 'smooth' });
  }

  /* ===========================================================
     SIMULADOR WHATSAPP
     =========================================================== */
  function whatsapp() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Pedidos por WhatsApp', 'Escribe un mensaje como lo haría un cliente y mira cómo el sistema lo interpreta y crea el pedido automáticamente.'));

    const chat = el('div', { class: 'wa-chat' });
    const input = el('input', { class: 'inp wa-input', placeholder: 'Ej: Hola, quiero 3 kilos de marraqueta para las 18:00' });
    const tel = el('input', { class: 'inp wa-tel', placeholder: 'Teléfono cliente +569...', value: '+56961234567' });

    function burbuja(texto, lado) {
      const b = el('div', { class: `wa-msg wa-${lado}` }, el('pre', {}, texto));
      chat.appendChild(b);
      chat.scrollTop = chat.scrollHeight;
    }

    function enviar() {
      const texto = input.value.trim();
      if (!texto) return;
      burbuja(texto, 'cliente');
      input.value = '';
      const parse = WhatsAppNLP.interpretar(texto);
      if (!parse.reconocido) {
        setTimeout(() => burbuja(WhatsAppNLP.respuestaBot(parse), 'bot'), 500);
        return;
      }
      const c = Store.upsertCliente({ telefono: parse.telefono || tel.value.trim() || '+56900000000', nombre: 'Cliente WhatsApp' });
      const pedido = Store.crearPedido({ clienteId: c.id, items: parse.items, metodoPago: 'efectivo', hora: parse.hora });
      setTimeout(() => {
        burbuja(WhatsAppNLP.respuestaBot(parse, pedido), 'bot');
        toast(`🛒 Nuevo pedido por WhatsApp #${String(pedido.id).padStart(3, '0')}`, 'pedido', 5000);
      }, 600);
    }

    input.addEventListener('keydown', e => { if (e.key === 'Enter') enviar(); });
    const enviarBtn = el('button', { class: 'btn-primary', onclick: enviar }, 'Enviar');

    // ejemplos rápidos
    const ejemplos = el('div', { class: 'wa-ejemplos' }, [
      'Quiero 2 kilos de hallulla',
      'Hola, 3 kilos de marraqueta para las 18:00',
      'Me mandas un kilo de pan amasado y medio de integral',
    ].map(txt => el('button', { class: 'chip', onclick: () => { input.value = txt; enviar(); } }, txt)));

    burbuja('🤖 ¡Hola! Soy el asistente de Pan Express. ¿Qué pan quieres pedir hoy?', 'bot');

    wrap.appendChild(el('div', { class: 'wa-box' }, [
      chat,
      ejemplos,
      el('div', { class: 'wa-controls' }, [tel, input, enviarBtn]),
    ]));
    return wrap;
  }

  /* ===========================================================
     DASHBOARD ADMIN
     =========================================================== */
  function dashboard() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Dashboard', 'Resumen del día — ' + Utils.HOY));

    const pedidosHoy = Store.pedidos().filter(p => p.fecha === Utils.HOY);
    const ventas = pedidosHoy.reduce((a, p) => a + p.total, 0);
    const nuevos = Store.clientes().filter(c => c.creado === Utils.HOY).length;
    const frecuentes = Store.clientes().filter(c => Utils.diasEntre(c.ultimaCompra, Utils.HOY) <= 7).length;

    wrap.appendChild(el('div', { class: 'kpi-grid' }, [
      kpi('💰', 'Vendido hoy', clp(ventas), 'verde'),
      kpi('🧾', 'Pedidos hoy', pedidosHoy.length, 'azul'),
      kpi('🆕', 'Clientes nuevos', nuevos, 'naranja'),
      kpi('⭐', 'Clientes frecuentes', frecuentes, 'morado'),
    ]));

    // Alertas
    const al = Utils.alertas();
    const alBox = el('div', { class: 'panel' }, [
      el('h2', {}, `Alertas (${al.length})`),
    ]);
    if (al.length === 0) alBox.appendChild(el('p', { class: 'muted' }, 'Todo en orden ✅'));
    al.slice(0, 8).forEach(a => alBox.appendChild(el('div', { class: `alerta alerta-${a.nivel}` }, [
      el('span', { class: 'al-ico' }, a.icono),
      el('span', { class: 'al-tipo' }, a.tipo),
      el('span', { class: 'al-txt' }, a.texto),
    ])));
    wrap.appendChild(alBox);

    // Pedidos en tiempo real (resumen)
    wrap.appendChild(tablaPedidos(pedidosHoy.slice(0, 6), 'Pedidos recientes'));
    return wrap;
  }

  /* ===========================================================
     GESTIÓN DE PEDIDOS
     =========================================================== */
  function pedidos() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Gestión de pedidos', 'Visualización y control en tiempo real'));
    wrap.appendChild(tablaPedidos(Store.pedidos(), null, true));
    return wrap;
  }

  function tablaPedidos(lista, tituloTxt, conAcciones = false) {
    const panel = el('div', { class: 'panel' });
    if (tituloTxt) panel.appendChild(el('h2', {}, tituloTxt));
    const tabla = el('table', { class: 'tabla' });
    tabla.appendChild(el('thead', {}, el('tr', {}, [
      'N°', 'Cliente', 'Dirección', 'Detalle', 'Total', 'Pago', 'Estado', conAcciones ? 'Acciones' : '',
    ].filter(h => h !== '').map(h => el('th', {}, h)))));
    const tbody = el('tbody');
    if (lista.length === 0) tbody.appendChild(el('tr', {}, el('td', { colspan: 8, class: 'muted' }, 'Sin pedidos')));
    lista.forEach(p => {
      const c = Store.clienteById(p.clienteId);
      const detalle = p.items.map(it => `${it.kilos}kg ${Store.productoById(it.productoId).nombre}`).join(', ');
      const tds = [
        el('td', {}, '#' + String(p.id).padStart(3, '0')),
        el('td', {}, c ? c.nombre : '—'),
        el('td', {}, c ? c.direccion : '—'),
        el('td', {}, detalle),
        el('td', {}, clp(p.total)),
        el('td', {}, p.metodoPago),
        el('td', {}, el('span', { class: 'badge badge-' + Utils.colorEstado(p.estado) }, Utils.nombreEstado(p.estado))),
      ];
      if (conAcciones) {
        const acc = el('td', {});
        if (p.estado !== 'entregado') {
          acc.appendChild(el('button', { class: 'btn-mini', onclick: () => { Store.avanzarEstado(p.id); toast('Estado actualizado: ' + Utils.nombreEstado(Store.pedidos().find(x => x.id === p.id).estado), 'ok'); } }, 'Avanzar ▶'));
        }
        const sel = el('select', { class: 'sel-mini', onchange: e => Store.asignarRepartidor(p.id, e.target.value || null) }, [
          el('option', { value: '' }, 'Repartidor…'),
          ...Store.repartidores().map(r => el('option', { value: r.id, ...(p.repartidorId === r.id ? { selected: 'selected' } : {}) }, r.nombre)),
        ]);
        acc.appendChild(sel);
        tds.push(acc);
      }
      tbody.appendChild(el('tr', {}, tds));
    });
    tabla.appendChild(tbody);
    panel.appendChild(tabla);
    return panel;
  }

  /* ===========================================================
     CLIENTES
     =========================================================== */
  function clientes() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Gestión de clientes', 'Base de datos y frecuencia de compra'));
    const panel = el('div', { class: 'panel' });
    const tabla = el('table', { class: 'tabla' });
    tabla.appendChild(el('thead', {}, el('tr', {}, ['Nombre', 'Teléfono', 'Dirección', 'Compras', 'Última compra', 'Estado'].map(h => el('th', {}, h)))));
    const tbody = el('tbody');
    Store.clientes().forEach(c => {
      const compras = Store.pedidos().filter(p => p.clienteId === c.id).length;
      const dias = Utils.diasEntre(c.ultimaCompra, Utils.HOY);
      const estado = dias >= 15 ? el('span', { class: 'badge badge-rojo' }, `Inactivo (${dias}d)`)
        : dias <= 7 ? el('span', { class: 'badge badge-verde' }, 'Frecuente')
        : el('span', { class: 'badge badge-gris' }, 'Ocasional');
      tbody.appendChild(el('tr', {}, [
        el('td', {}, c.nombre), el('td', {}, c.telefono), el('td', {}, c.direccion),
        el('td', {}, String(compras)), el('td', {}, c.ultimaCompra), el('td', {}, estado),
      ]));
    });
    tabla.appendChild(tbody);
    panel.appendChild(tabla);
    wrap.appendChild(panel);
    return wrap;
  }

  /* ===========================================================
     REPARTIDORES
     =========================================================== */
  function repartidores() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Gestión de repartidores', 'Registro y control de entregas'));

    const panel = el('div', { class: 'panel' });
    const tabla = el('table', { class: 'tabla' });
    tabla.appendChild(el('thead', {}, el('tr', {}, ['Nombre', 'Vehículo', 'Patente', 'Teléfono', 'Entregados', 'Pendientes', 'Horas', 'Km'].map(h => el('th', {}, h)))));
    const tbody = el('tbody');
    Store.repartidores().forEach(r => {
      const entregados = Store.pedidos().filter(p => p.repartidorId === r.id && p.estado === 'entregado').length;
      const pend = Store.pedidos().filter(p => p.repartidorId === r.id && p.estado === 'reparto').length;
      tbody.appendChild(el('tr', {}, [
        el('td', {}, r.nombre), el('td', {}, r.vehiculo), el('td', {}, r.patente),
        el('td', {}, r.telefono), el('td', {}, String(entregados)), el('td', {}, String(pend)),
        el('td', {}, r.horas + ' h'), el('td', {}, r.km + ' km'),
      ]));
    });
    tabla.appendChild(tbody);
    panel.appendChild(tabla);
    wrap.appendChild(panel);

    // Alta de repartidor
    const f = formInline('Registrar repartidor', ['Nombre', 'Vehículo', 'Patente', 'Teléfono'], (vals) => {
      if (!vals.Nombre) return toast('Falta el nombre', 'warn');
      Store.addRepartidor({ nombre: vals.Nombre, vehiculo: vals.Vehículo, patente: vals.Patente, telefono: vals.Teléfono });
      toast('Repartidor registrado', 'ok');
    });
    wrap.appendChild(f);
    return wrap;
  }

  /* ===========================================================
     CONTROL DE GASTOS (personal, vehículos, gastos)
     =========================================================== */
  function gastos() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Control de gastos', 'Mano de obra, vehículos y egresos'));

    // Personal / sueldos
    const pPanel = el('div', { class: 'panel' }, el('h2', {}, 'Mano de obra (sueldos)'));
    const tP = el('table', { class: 'tabla' });
    tP.appendChild(el('thead', {}, el('tr', {}, ['Trabajador', 'Cargo', 'Área', 'Sueldo'].map(h => el('th', {}, h)))));
    const tbP = el('tbody');
    Store.personal().forEach(p => tbP.appendChild(el('tr', {}, [
      el('td', {}, p.nombre), el('td', {}, p.cargo), el('td', {}, p.area), el('td', {}, clp(p.sueldo)),
    ])));
    const totalSueldos = Store.personal().reduce((a, p) => a + p.sueldo, 0);
    tbP.appendChild(el('tr', { class: 'tr-total' }, [el('td', { colspan: 3 }, 'Total planilla'), el('td', {}, clp(totalSueldos))]));
    tP.appendChild(tbP); pPanel.appendChild(tP); wrap.appendChild(pPanel);

    // Vehículos
    const vPanel = el('div', { class: 'panel' }, el('h2', {}, 'Vehículos y mantención'));
    const tV = el('table', { class: 'tabla' });
    tV.appendChild(el('thead', {}, el('tr', {}, ['Vehículo', 'Patente', 'Próx. aceite', 'Neumáticos', 'Rev. técnica', 'Seguro', 'Km'].map(h => el('th', {}, h)))));
    const tbV = el('tbody');
    Store.vehiculos().forEach(v => {
      const alerta = (v.proxAceite && Utils.diasEntre(Utils.HOY, v.proxAceite) <= 5) || v.neumaticos === 'Revisar';
      tbV.appendChild(el('tr', alerta ? { class: 'tr-alerta' } : {}, [
        el('td', {}, v.nombre), el('td', {}, v.patente), el('td', {}, v.proxAceite),
        el('td', {}, v.neumaticos), el('td', {}, v.revisionTecnica), el('td', {}, v.seguro), el('td', {}, v.kmActual + ' km'),
      ]));
    });
    tV.appendChild(tbV); vPanel.appendChild(tV); wrap.appendChild(vPanel);

    // Gastos varios
    const gPanel = el('div', { class: 'panel' }, el('h2', {}, 'Egresos registrados'));
    const tG = el('table', { class: 'tabla' });
    tG.appendChild(el('thead', {}, el('tr', {}, ['Fecha', 'Categoría', 'Detalle', 'Monto'].map(h => el('th', {}, h)))));
    const tbG = el('tbody');
    function pintarGastos() {
      tbG.innerHTML = '';
      Store.gastos().forEach(g => tbG.appendChild(el('tr', {}, [
        el('td', {}, g.fecha), el('td', {}, g.categoria), el('td', {}, g.detalle), el('td', {}, clp(g.monto)),
      ])));
    }
    pintarGastos();
    tG.appendChild(tbG); gPanel.appendChild(tG);

    const f = formInline('Registrar gasto', ['Categoría', 'Detalle', 'Monto'], (vals) => {
      const monto = parseInt(vals.Monto, 10);
      if (!monto) return toast('Monto inválido', 'warn');
      Store.addGasto({ categoria: vals.Categoría || 'Varios', detalle: vals.Detalle || '', monto });
      pintarGastos(); toast('Gasto registrado', 'ok');
    });
    gPanel.appendChild(f);
    wrap.appendChild(gPanel);
    return wrap;
  }

  /* ===========================================================
     INSUMOS
     =========================================================== */
  function insumos() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Control de insumos', 'Stock, consumo y alertas automáticas'));
    const panel = el('div', { class: 'panel' });
    const grid = el('div', { class: 'insumo-grid' });
    function pintar() {
      grid.innerHTML = '';
      Store.insumos().forEach(i => {
        const bajo = i.stock <= i.minimo;
        const pct = Math.min(100, Math.round((i.stock / (i.minimo * 2)) * 100));
        grid.appendChild(el('div', { class: 'insumo-card ' + (bajo ? 'bajo' : '') }, [
          el('div', { class: 'insumo-top' }, [
            el('h3', {}, i.nombre),
            bajo ? el('span', { class: 'badge badge-rojo' }, 'Stock bajo') : el('span', { class: 'badge badge-verde' }, 'OK'),
          ]),
          el('div', { class: 'insumo-stock' }, `${i.stock} ${i.unidad}`),
          el('div', { class: 'barra-bg' }, el('div', { class: 'barra-fill ' + (bajo ? 'rojo' : '') , style: `width:${pct}%` })),
          el('div', { class: 'insumo-info' }, `Mínimo: ${i.minimo} ${i.unidad} · Consumo: ${i.consumoDiario}/día` + (i.vence ? ` · Vence: ${i.vence}` : '')),
          el('div', { class: 'insumo-acc' }, [
            el('button', { class: 'btn-mini', onclick: () => { Store.addInsumoStock(i.id, 10); toast(`+10 ${i.unidad} de ${i.nombre}`, 'ok'); pintar(); } }, '+10 reponer'),
          ]),
        ]));
      });
    }
    pintar();
    panel.appendChild(grid);
    wrap.appendChild(panel);
    return wrap;
  }

  /* ===========================================================
     MÓDULO FINANCIERO
     =========================================================== */
  function finanzas() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Módulo financiero', 'Ingresos, egresos y utilidad'));

    const ventasHoy = Store.pedidos().filter(p => p.fecha === Utils.HOY).reduce((a, p) => a + p.total, 0);
    const ventasTotal = Store.pedidos().reduce((a, p) => a + p.total, 0);
    const sueldos = Store.personal().reduce((a, p) => a + p.sueldo, 0);
    const gastosVarios = Store.gastos().reduce((a, g) => a + g.monto, 0);
    // Egresos mensuales estimados: sueldos (mes) + gastos registrados
    const egresos = sueldos + gastosVarios;
    const utilidad = ventasTotal - gastosVarios; // utilidad operativa simple (sin prorratear sueldo mensual)

    wrap.appendChild(el('div', { class: 'kpi-grid' }, [
      kpi('📈', 'Ventas hoy', clp(ventasHoy), 'verde'),
      kpi('💵', 'Ventas acumuladas', clp(ventasTotal), 'azul'),
      kpi('📉', 'Egresos (sueldos+gastos)', clp(egresos), 'naranja'),
      kpi(utilidad >= 0 ? '✅' : '⚠️', 'Utilidad', clp(utilidad), utilidad >= 0 ? 'morado' : 'rojo'),
    ]));

    // Desglose egresos
    const panel = el('div', { class: 'panel' }, el('h2', {}, 'Desglose de egresos'));
    const porCat = {};
    Store.gastos().forEach(g => porCat[g.categoria] = (porCat[g.categoria] || 0) + g.monto);
    porCat['Sueldos (mensual)'] = sueldos;
    const tabla = el('table', { class: 'tabla' });
    tabla.appendChild(el('thead', {}, el('tr', {}, ['Categoría', 'Monto', '% del egreso'].map(h => el('th', {}, h)))));
    const tb = el('tbody');
    Object.entries(porCat).sort((a, b) => b[1] - a[1]).forEach(([cat, monto]) => {
      tb.appendChild(el('tr', {}, [el('td', {}, cat), el('td', {}, clp(monto)), el('td', {}, Math.round(monto / egresos * 100) + '%')]));
    });
    tabla.appendChild(tb); panel.appendChild(tabla);
    wrap.appendChild(panel);

    wrap.appendChild(el('div', { class: 'panel formula' }, el('p', { html: '<strong>Fórmula:</strong> Ingresos − Gastos = Ganancia &nbsp;→&nbsp; ' + clp(ventasTotal) + ' − ' + clp(gastosVarios) + ' = <strong>' + clp(utilidad) + '</strong>' })));
    return wrap;
  }

  /* ===========================================================
     REPORTES
     =========================================================== */
  function reportes() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Reportes', 'Diario y mensual'));

    // Productos más vendidos
    const porProd = {};
    Store.pedidos().forEach(p => p.items.forEach(it => porProd[it.productoId] = (porProd[it.productoId] || 0) + it.kilos));
    const ranking = Object.entries(porProd).sort((a, b) => b[1] - a[1]);

    const ventasHoy = Store.pedidos().filter(p => p.fecha === Utils.HOY).reduce((a, p) => a + p.total, 0);
    const gastosHoy = Store.gastos().filter(g => g.fecha === Utils.HOY).reduce((a, g) => a + g.monto, 0);

    const rDia = el('div', { class: 'panel' }, [
      el('h2', {}, 'Reporte diario — ' + Utils.HOY),
      reportRow('Ventas', clp(ventasHoy)),
      reportRow('Gastos', clp(gastosHoy)),
      reportRow('Utilidad', clp(ventasHoy - gastosHoy)),
    ]);
    wrap.appendChild(rDia);

    const prodPanel = el('div', { class: 'panel' }, el('h2', {}, 'Productos más vendidos'));
    const max = ranking.length ? ranking[0][1] : 1;
    ranking.forEach(([id, kilos]) => {
      const p = Store.productoById(id);
      prodPanel.appendChild(el('div', { class: 'rank-row' }, [
        el('span', { class: 'rank-name' }, `${p.emoji} ${p.nombre}`),
        el('div', { class: 'barra-bg' }, el('div', { class: 'barra-fill', style: `width:${Math.round(kilos / max * 100)}%` })),
        el('span', { class: 'rank-val' }, kilos + ' kg'),
      ]));
    });
    wrap.appendChild(prodPanel);

    const nuevos = Store.clientes().filter(c => c.creado === Utils.HOY).length;
    const rMes = el('div', { class: 'panel' }, [
      el('h2', {}, 'Reporte mensual (resumen)'),
      reportRow('Clientes nuevos', nuevos),
      reportRow('Total clientes', Store.clientes().length),
      reportRow('Pedidos acumulados', Store.pedidos().length),
      reportRow('Ventas acumuladas', clp(Store.pedidos().reduce((a, p) => a + p.total, 0))),
    ]);
    wrap.appendChild(rMes);
    return wrap;
  }

  /* ===========================================================
     CENTRO DE ALERTAS
     =========================================================== */
  function centroAlertas() {
    const wrap = el('div', { class: 'view' });
    wrap.appendChild(titulo('Centro de alertas', 'Notificaciones automáticas del negocio'));
    const al = Utils.alertas();
    const panel = el('div', { class: 'panel' });
    if (al.length === 0) panel.appendChild(el('p', { class: 'muted' }, 'No hay alertas activas ✅'));
    al.forEach(a => panel.appendChild(el('div', { class: `alerta alerta-${a.nivel}` }, [
      el('span', { class: 'al-ico' }, a.icono),
      el('span', { class: 'al-tipo' }, a.tipo),
      el('span', { class: 'al-txt' }, a.texto),
    ])));
    wrap.appendChild(panel);
    return wrap;
  }

  /* ===========================================================
     Helpers de UI
     =========================================================== */
  function titulo(t, sub) {
    return el('div', { class: 'view-head' }, [el('h1', {}, t), sub ? el('p', {}, sub) : null]);
  }
  function kpi(ico, label, val, color) {
    return el('div', { class: 'kpi kpi-' + color }, [
      el('div', { class: 'kpi-ico' }, ico),
      el('div', {}, [el('div', { class: 'kpi-val' }, String(val)), el('div', { class: 'kpi-label' }, label)]),
    ]);
  }
  function reportRow(label, val) {
    return el('div', { class: 'report-row' }, [el('span', {}, label), el('strong', {}, String(val))]);
  }
  function formInline(titulo, campos, onSubmit) {
    const inputs = {};
    const row = el('div', { class: 'form-inline' });
    campos.forEach(c => { inputs[c] = el('input', { class: 'inp', placeholder: c }); row.appendChild(inputs[c]); });
    row.appendChild(el('button', { class: 'btn-primary', onclick: () => {
      const vals = {}; Object.entries(inputs).forEach(([k, v]) => vals[k] = v.value.trim());
      onSubmit(vals); Object.values(inputs).forEach(v => v.value = '');
    } }, 'Guardar'));
    return el('div', { class: 'form-block' }, [el('h3', {}, titulo), row]);
  }

  return {
    cliente, whatsapp, dashboard, pedidos, clientes, repartidores,
    gastos, insumos, finanzas, reportes, centroAlertas,
  };
})();
