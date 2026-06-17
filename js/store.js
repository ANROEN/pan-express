/* ============================================================
   PAN EXPRESS — Capa de datos (store.js)
   Persistencia simple en localStorage del navegador.
   No requiere servidor. Reemplazable luego por PostgreSQL/MySQL.
   ============================================================ */

window.Store = (() => {
  const KEY = 'panexpress_db_v1';

  /* ---------- Datos iniciales (semilla de ejemplo) ---------- */
  function seed() {
    const hoy = '2026-06-16';
    return {
      meta: { version: 1, creado: hoy },

      // Catálogo de productos. Precio por KILO en pesos chilenos (CLP).
      productos: [
        { id: 'marraqueta', nombre: 'Marraqueta',      precio: 1800, unidad: 'kilo', emoji: '🥖', activo: true },
        { id: 'hallulla',   nombre: 'Hallulla',        precio: 1700, unidad: 'kilo', emoji: '🫓', activo: true },
        { id: 'amasado',    nombre: 'Pan amasado',     precio: 2200, unidad: 'kilo', emoji: '🍞', activo: true },
        { id: 'integral',   nombre: 'Pan integral',    precio: 2500, unidad: 'kilo', emoji: '🌾', activo: true },
        { id: 'especial',   nombre: 'Pan especial',    precio: 3200, unidad: 'kilo', emoji: '✨', activo: true },
      ],

      clientes: [
        { id: 'c1', nombre: 'Juan Pérez',     telefono: '+56961234567', direccion: 'Av. Centro 123, Centro',        creado: '2026-01-10', ultimaCompra: '2026-06-15' },
        { id: 'c2', nombre: 'Pedro Soto',     telefono: '+56962345678', direccion: 'Pasaje Los Álamos 45, Villa Madrid', creado: '2026-02-02', ultimaCompra: '2026-06-14' },
        { id: 'c3', nombre: 'María González', telefono: '+56963456789', direccion: 'Calle Larga 980, Población Norte', creado: '2026-03-20', ultimaCompra: '2026-05-28' },
        { id: 'c4', nombre: 'Rosa Muñoz',     telefono: '+56964567890', direccion: 'Los Aromos 12, El Mirador',      creado: '2026-04-05', ultimaCompra: '2026-06-16' },
      ],

      repartidores: [
        { id: 'r1', nombre: 'Carlos Reyes',  vehiculo: 'Moto Honda',  patente: 'JV-4521', telefono: '+56971112233', activo: true,  horas: 142, km: 880 },
        { id: 'r2', nombre: 'Diego Fuentes', vehiculo: 'Furgón Kia',  patente: 'KX-9087', telefono: '+56972223344', activo: true,  horas: 120, km: 1240 },
      ],

      // Pedidos. items: [{productoId, kilos}]
      pedidos: [
        { id: 1, clienteId: 'c1', items: [{ productoId: 'marraqueta', kilos: 3 }], total: 5400, metodoPago: 'efectivo', estado: 'reparto',     repartidorId: 'r1', hora: '18:00', fecha: '2026-06-16', creado: '2026-06-16T16:20:00' },
        { id: 2, clienteId: 'c2', items: [{ productoId: 'hallulla', kilos: 2 }],   total: 3400, metodoPago: 'transferencia', estado: 'preparacion', repartidorId: null, hora: '17:30', fecha: '2026-06-16', creado: '2026-06-16T16:05:00' },
        { id: 3, clienteId: 'c4', items: [{ productoId: 'amasado', kilos: 1 }, { productoId: 'integral', kilos: 1 }], total: 4700, metodoPago: 'tarjeta', estado: 'entregado', repartidorId: 'r2', hora: '09:15', fecha: '2026-06-16', creado: '2026-06-16T08:40:00' },
      ],

      // Insumos de producción
      insumos: [
        { id: 'harina',   nombre: 'Harina',   stock: 48,  unidad: 'kg', minimo: 50, consumoDiario: 35, vence: null },
        { id: 'levadura', nombre: 'Levadura', stock: 6,   unidad: 'kg', minimo: 4,  consumoDiario: 2,  vence: '2026-08-01' },
        { id: 'sal',      nombre: 'Sal',      stock: 22,  unidad: 'kg', minimo: 10, consumoDiario: 3,  vence: null },
        { id: 'bolsas',   nombre: 'Bolsas',   stock: 120, unidad: 'un', minimo: 200, consumoDiario: 90, vence: null },
      ],

      // Planilla de sueldos (mano de obra)
      personal: [
        { id: 'p1', nombre: 'Luis Carrasco',  cargo: 'Panadero',      area: 'Producción', sueldo: 650000 },
        { id: 'p2', nombre: 'Carlos Reyes',   cargo: 'Repartidor',    area: 'Entrega',    sueldo: 480000 },
        { id: 'p3', nombre: 'Diego Fuentes',  cargo: 'Repartidor',    area: 'Entrega',    sueldo: 480000 },
        { id: 'p4', nombre: 'Fernando López', cargo: 'Administrador', area: 'Gestión',    sueldo: 700000 },
      ],

      // Vehículos y su mantención
      vehiculos: [
        { id: 'v1', nombre: 'Moto Honda', patente: 'JV-4521', proxAceite: '2026-06-20', neumaticos: 'Bien',     revisionTecnica: '2026-11-01', seguro: '2027-01-15', kmActual: 18400 },
        { id: 'v2', nombre: 'Furgón Kia', patente: 'KX-9087', proxAceite: '2026-07-10', neumaticos: 'Revisar',  revisionTecnica: '2026-09-12', seguro: '2026-12-01', kmActual: 92300 },
      ],

      // Gastos varios registrados (combustible, servicios, mantención, insumos comprados)
      gastos: [
        { id: 'g1', fecha: '2026-06-16', categoria: 'Combustible', detalle: 'Bencina moto',        monto: 12000 },
        { id: 'g2', fecha: '2026-06-15', categoria: 'Insumos',     detalle: 'Compra harina 50kg',  monto: 32000 },
        { id: 'g3', fecha: '2026-06-14', categoria: 'Servicios',   detalle: 'Luz y agua',          monto: 85000 },
        { id: 'g4', fecha: '2026-06-12', categoria: 'Mantención',  detalle: 'Cambio aceite furgón',monto: 45000 },
      ],

      seq: { pedido: 4 }, // próximo número de pedido
    };
  }

  /* ---------- Carga / guardado ---------- */
  // El arranque nunca debe fallar aunque el almacenamiento no esté disponible.
  let db;
  try { db = load(); } catch (e) { console.warn('Arranque en memoria', e); db = seed(); }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('No se pudo leer la base local', e); }
    // Datos de ejemplo en memoria; se persistirán al primer cambio.
    return seed();
  }

  function save(next) {
    db = next || db;
    // El almacenamiento puede no estar disponible (modo incógnito, file://
    // con restricciones, etc.). Si falla, seguimos en memoria sin caernos.
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.warn('No se pudo guardar en localStorage; se trabaja en memoria.', e); }
    document.dispatchEvent(new CustomEvent('db:change'));
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ }
    db = seed();
    save();
    document.dispatchEvent(new CustomEvent('db:change'));
  }

  /* ---------- Accesores ---------- */
  const get = () => db;
  const productos    = () => db.productos;
  const productoById = (id) => db.productos.find(p => p.id === id);
  const clientes     = () => db.clientes;
  const clienteById  = (id) => db.clientes.find(c => c.id === id);
  const repartidores = () => db.repartidores;
  const repartidorById = (id) => db.repartidores.find(r => r.id === id);
  const pedidos      = () => db.pedidos;
  const insumos      = () => db.insumos;
  const personal     = () => db.personal;
  const vehiculos    = () => db.vehiculos;
  const gastos       = () => db.gastos;

  /* ---------- Operaciones ---------- */

  // Busca cliente por teléfono o crea uno nuevo.
  function upsertCliente({ nombre, telefono, direccion }) {
    let c = db.clientes.find(x => x.telefono === telefono);
    if (c) {
      if (nombre) c.nombre = nombre;
      if (direccion) c.direccion = direccion;
      c.ultimaCompra = '2026-06-16';
    } else {
      c = {
        id: 'c_' + db.seq.pedido + '_' + db.clientes.length,
        nombre: nombre || 'Cliente',
        telefono, direccion: direccion || '',
        creado: '2026-06-16', ultimaCompra: '2026-06-16',
      };
      db.clientes.push(c);
    }
    return c;
  }

  function calcularTotal(items) {
    return items.reduce((acc, it) => {
      const p = productoById(it.productoId);
      return acc + (p ? p.precio * it.kilos : 0);
    }, 0);
  }

  function crearPedido({ clienteId, items, metodoPago, hora, repartidorId = null }) {
    const id = db.seq.pedido++;
    const pedido = {
      id, clienteId, items,
      total: calcularTotal(items),
      metodoPago: metodoPago || 'efectivo',
      estado: 'recibido',
      repartidorId,
      hora: hora || '',
      fecha: '2026-06-16',
      creado: '2026-06-16T' + new Date().toTimeString().slice(0, 8),
    };
    db.pedidos.unshift(pedido);
    // descuenta bolsas como insumo (1 por pedido, demo)
    const bolsas = db.insumos.find(i => i.id === 'bolsas');
    if (bolsas) bolsas.stock = Math.max(0, bolsas.stock - 1);
    save();
    return pedido;
  }

  const ESTADOS = ['recibido', 'preparacion', 'reparto', 'entregado'];
  function avanzarEstado(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p) return;
    const i = ESTADOS.indexOf(p.estado);
    if (i < ESTADOS.length - 1) p.estado = ESTADOS[i + 1];
    save();
  }

  function setEstado(pedidoId, estado) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (p) { p.estado = estado; save(); }
  }

  function asignarRepartidor(pedidoId, repartidorId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (p) { p.repartidorId = repartidorId; save(); }
  }

  function addGasto(g) {
    db.gastos.unshift({ id: 'g' + (db.gastos.length + 1) + '_' + db.seq.pedido, fecha: '2026-06-16', ...g });
    save();
  }

  function addInsumoStock(id, cantidad) {
    const i = db.insumos.find(x => x.id === id);
    if (i) { i.stock += cantidad; save(); }
  }

  function addRepartidor(r) {
    db.repartidores.push({ id: 'r' + (db.repartidores.length + 1), activo: true, horas: 0, km: 0, ...r });
    save();
  }

  function addProducto(p) {
    db.productos.push({ activo: true, unidad: 'kilo', emoji: '🍞', ...p });
    save();
  }

  return {
    get, save, reset,
    productos, productoById, clientes, clienteById,
    repartidores, repartidorById, pedidos, insumos, personal, vehiculos, gastos,
    upsertCliente, calcularTotal, crearPedido, avanzarEstado, setEstado,
    asignarRepartidor, addGasto, addInsumoStock, addRepartidor, addProducto,
    ESTADOS,
  };
})();
