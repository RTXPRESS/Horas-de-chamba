// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Base de datos
const db = new sqlite3.Database('db.sqlite');

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT,
  horas REAL,
  feriado INTEGER,
  horaInicio TEXT,
  horaFin TEXT
)`);

// Ruta para obtener registros
app.get('/api/registros', (req, res) => {
  db.all("SELECT * FROM registros ORDER BY fecha DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ruta para agregar registro
app.post('/api/registros', (req, res) => {
  const { fecha, horas, feriado, horaInicio, horaFin } = req.body;
  db.run(`INSERT INTO registros (fecha, horas, feriado, horaInicio, horaFin) VALUES (?, ?, ?, ?, ?)`,
    [fecha, horas, feriado ? 1 : 0, horaInicio, horaFin],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Ruta para borrar todo
app.delete('/api/registros', (req, res) => {
  db.run("DELETE FROM registros", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Registros eliminados" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
