/* ============================================================
   PAN EXPRESS — Servidor local (server.js)
   Node.js + Express + SQLite (base de datos integrada).
   Sirve la interfaz y guarda todos los datos en un archivo local
   (panexpress.db). No necesita contraseña, ni internet, ni pagos.
   ============================================================ */

const path = require('path');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.join(__dirname, '..');                 // carpeta del proyecto (frontend)
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'panexpress.db');   // archivo de la base de datos

/* ---------- Base de datos ---------- */
const db = new DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id         INTEGER PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);
const selState = db.prepare('SELECT data, updated_at FROM app_state WHERE id = 1');
const upsState = db.prepare(`
  INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
`);

/* ---------- API ---------- */
const app = express();
app.use(express.json({ limit: '5mb' }));

// Leer el estado completo del negocio
app.get('/api/state', (req, res) => {
  try {
    const row = selState.get();
    if (!row) return res.json({ data: null });
    res.json({ data: JSON.parse(row.data), updated_at: row.updated_at });
  } catch (e) {
    console.error('Error GET /api/state:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Guardar el estado completo
app.put('/api/state', (req, res) => {
  try {
    const data = req.body && req.body.data;
    if (!data) return res.status(400).json({ error: 'Falta el campo data' });
    upsState.run(JSON.stringify(data), new Date().toISOString());
    res.json({ ok: true });
  } catch (e) {
    console.error('Error PUT /api/state:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Comprobación de salud
app.get('/api/health', (req, res) => res.json({ ok: true, servidor: 'pan-express' }));

// Servir el frontend (index.html, css, js)
app.use(express.static(ROOT));

/* ---------- Arranque ---------- */
app.listen(PORT, () => {
  console.log('\n  🥖  PAN EXPRESS — servidor en marcha');
  console.log('  📂  Base de datos: ' + DB_FILE);
  console.log('  ➜   Abre en tu navegador:  http://localhost:' + PORT + '\n');
  console.log('  (Deja esta ventana abierta mientras usas la app.)\n');
});
