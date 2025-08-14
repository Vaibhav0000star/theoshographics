
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads dir
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^\w.\-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

// Database init
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = wal');

db.exec(`
CREATE TABLE IF NOT EXISTS specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_title TEXT,
  client_name TEXT,
  date TEXT,
  quantity INTEGER,
  open_size_w REAL,
  open_size_h REAL,
  closed_size_w REAL,
  closed_size_h REAL,
  orientation TEXT,
  page_count_type TEXT,
  page_count INTEGER,
  printing_sides TEXT,
  cover_paper TEXT,
  inner_paper TEXT,
  printing_type TEXT,
  cover_finish TEXT,
  foil_area TEXT,
  spot_uv_area TEXT,
  binding_type TEXT,
  spine_thickness REAL,
  creasing TEXT,
  trimming_notes TEXT,
  special_instructions TEXT,
  file_format TEXT,
  bleed REAL,
  safe_zone REAL,
  color_profile TEXT,
  keyline_image_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`);

// Helpers
const insertStmt = db.prepare(`
INSERT INTO specs (
  project_title, client_name, date, quantity,
  open_size_w, open_size_h, closed_size_w, closed_size_h,
  orientation, page_count_type, page_count, printing_sides,
  cover_paper, inner_paper, printing_type, cover_finish,
  foil_area, spot_uv_area, binding_type, spine_thickness,
  creasing, trimming_notes, special_instructions, file_format,
  bleed, safe_zone, color_profile, keyline_image_url, created_at, updated_at
) VALUES (
  @project_title, @client_name, @date, @quantity,
  @open_size_w, @open_size_h, @closed_size_w, @closed_size_h,
  @orientation, @page_count_type, @page_count, @printing_sides,
  @cover_paper, @inner_paper, @printing_type, @cover_finish,
  @foil_area, @spot_uv_area, @binding_type, @spine_thickness,
  @creasing, @trimming_notes, @special_instructions, @file_format,
  @bleed, @safe_zone, @color_profile, @keyline_image_url, datetime('now'), datetime('now')
);
`);

const updateStmt = db.prepare(`
UPDATE specs SET
  project_title=@project_title, client_name=@client_name, date=@date, quantity=@quantity,
  open_size_w=@open_size_w, open_size_h=@open_size_h, closed_size_w=@closed_size_w, closed_size_h=@closed_size_h,
  orientation=@orientation, page_count_type=@page_count_type, page_count=@page_count, printing_sides=@printing_sides,
  cover_paper=@cover_paper, inner_paper=@inner_paper, printing_type=@printing_type, cover_finish=@cover_finish,
  foil_area=@foil_area, spot_uv_area=@spot_uv_area, binding_type=@binding_type, spine_thickness=@spine_thickness,
  creasing=@creasing, trimming_notes=@trimming_notes, special_instructions=@special_instructions, file_format=@file_format,
  bleed=@bleed, safe_zone=@safe_zone, color_profile=@color_profile, keyline_image_url=@keyline_image_url,
  updated_at=datetime('now')
WHERE id=@id;
`);

// API routes
app.get('/api/specs', (req, res) => {
  const rows = db.prepare('SELECT * FROM specs ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/specs/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM specs WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/specs', (req, res) => {
  const payload = req.body || {};
  const info = insertStmt.run(payload);
  const row = db.prepare('SELECT * FROM specs WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/specs/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM specs WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Not found' });
  const merged = { ...current, ...req.body, id: current.id };
  updateStmt.run(merged);
  const row = db.prepare('SELECT * FROM specs WHERE id = ?').get(req.params.id);
  res.json(row);
});

app.delete('/api/specs/:id', (req, res) => {
  const info = db.prepare('DELETE FROM specs WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes > 0 });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
