const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Setup
const db = new sqlite3.Database('entries.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    song TEXT NOT NULL,
    name TEXT NOT NULL,
    link TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Admin Password (Edit this file post-deploy)
const adminPassFile = path.join(__dirname, 'admin_pass.txt');
let ADMIN_PASS = 'default123';
if (!fs.existsSync(adminPassFile)) {
  fs.writeFileSync(adminPassFile, ADMIN_PASS);
} else {
  ADMIN_PASS = fs.readFileSync(adminPassFile, 'utf8').trim();
}

// UUID Cookie (Only after consent—handled in frontend)
app.use((req, res, next) => {
  if (req.cookies.uuid) next();
  else next(); // Defer to frontend consent
});

// Entry Routes (Admins use same form—UUID handles uniqueness)
app.post('/api/entry', (req, res) => {
  const { song, name, link } = req.body;
  const uuid = req.cookies.uuid || uuidv4(); // Fallback for admins
  if (!song || !name || !link) return res.status(400).json({ error: 'Missing fields' });

  db.get('SELECT id FROM entries WHERE id = ?', [uuid], (err, row) => {
    if (row) {
      db.run('UPDATE entries SET song = ?, name = ?, link = ? WHERE id = ?', [song, name, link, uuid]);
    } else {
      db.run('INSERT INTO entries (id, song, name, link) VALUES (?, ?, ?, ?)', [uuid, song, name, link]);
    }
    res.cookie('uuid', uuid, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.json({ success: true });
  });
});

app.get('/api/entry', (req, res) => {
  const uuid = req.cookies.uuid;
  db.get('SELECT * FROM entries WHERE id = ?', [uuid], (err, row) => {
    res.json(row || {});
  });
});

app.get('/api/entries', (req, res) => {
  db.all('SELECT id, song, link, timestamp FROM entries ORDER BY timestamp DESC', (err, rows) => {
    res.json(rows);
  });
});

// Admin Auth
app.post('/api/admin/auth', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    res.cookie('admin', 'true', { maxAge: 60 * 60 * 1000 });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/admin/entries', (req, res) => {
  if (!req.cookies.admin) return res.status(401).json({ error: 'Unauthorized' });
  db.all('SELECT * FROM entries ORDER BY timestamp DESC', (err, rows) => {
    res.json(rows);
  });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
