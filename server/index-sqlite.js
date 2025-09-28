import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const app = express()
app.use(cors())
app.use(express.json())

// SQLite database connection
let db

async function initDB() {
  db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  })

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      tags TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      due_date DATE,
      estimate INTEGER DEFAULT 0,
      spent INTEGER DEFAULT 0,
      user_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      day DATE NOT NULL,
      minutes INTEGER DEFAULT 0
    )
  `)

  // Create admin user if not exists
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['admin@admin.com'])
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10)
    await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      ['admin', 'admin@admin.com', passwordHash]
    )
    console.log('Created admin user')
  }
}

initDB().catch(console.error)

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function auth(req, res, next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Unauthorized' })
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email, username: payload.username }
    next()
  }catch(e){
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/health', async (req, res) => {
  try {
    await db.get('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Auth
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Popuni sva polja' })
  const password_hash = await bcrypt.hash(password, 10)
  try {
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    )
    const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', [result.lastID])
    res.json({ ok: true, user })
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email već postoji' })
    }
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Prazna polja' })
  const user = await db.get('SELECT id, username, email, password_hash FROM users WHERE email = ?', [email])
  if (!user) return res.status(401).json({ error: 'Neispravni kredencijali' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Neispravni kredencijali' })
  const token = jwt.sign({ sub: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

// Snippets (protected)
app.get('/api/snippets', auth, async (req, res) => {
  const { q } = req.query
  let query = 'SELECT * FROM snippets WHERE user_id = ? ORDER BY created_at DESC'
  let params = [req.user.id]
  if (q) {
    query = `SELECT * FROM snippets WHERE user_id = ? AND (LOWER(title) LIKE ? OR LOWER(code) LIKE ?) ORDER BY created_at DESC`
    params = [req.user.id, `%${String(q).toLowerCase()}%`, `%${String(q).toLowerCase()}%`]
  }
  const snippets = await db.all(query, params)
  // Parse tags from JSON string
  const parsedSnippets = snippets.map(s => ({
    ...s,
    tags: s.tags ? JSON.parse(s.tags) : []
  }))
  res.json(parsedSnippets)
})

app.post('/api/snippets', auth, async (req, res) => {
  const { title, code, language, tags } = req.body || {}
  const result = await db.run(
    `INSERT INTO snippets (user_id, title, code, language, tags) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, title || 'Snippet', code || '', language || 'javascript', JSON.stringify(tags || [])]
  )
  const snippet = await db.get('SELECT * FROM snippets WHERE id = ?', [result.lastID])
  res.status(201).json({
    ...snippet,
    tags: snippet.tags ? JSON.parse(snippet.tags) : []
  })
})

app.put('/api/snippets/:id', auth, async (req, res) => {
  const { id } = req.params
  const { title, code, language, tags } = req.body || {}
  await db.run(
    `UPDATE snippets 
     SET title = COALESCE(?, title), 
         code = COALESCE(?, code), 
         language = COALESCE(?, language), 
         tags = COALESCE(?, tags), 
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [title, code, language, tags ? JSON.stringify(tags) : null, id, req.user.id]
  )
  const snippet = await db.get('SELECT * FROM snippets WHERE id = ? AND user_id = ?', [id, req.user.id])
  if (!snippet) return res.status(404).json({ error: 'Not found' })
  res.json({
    ...snippet,
    tags: snippet.tags ? JSON.parse(snippet.tags) : []
  })
})

app.delete('/api/snippets/:id', auth, async (req, res) => {
  const { id } = req.params
  const result = await db.run('DELETE FROM snippets WHERE id = ? AND user_id = ?', [id, req.user.id])
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

// Tasks (protected)
app.get('/api/tasks', auth, async (req, res) => {
  const tasks = await db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
  res.json(tasks)
})

app.post('/api/tasks', auth, async (req, res) => {
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  const result = await db.run(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date, estimate, spent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, title || 'Bez naslova', description || '', status || 'todo', priority || 'medium', dueDate || null, Number(estimate || 0), Number(spent || 0)]
  )
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID])
  res.status(201).json(task)
})

app.put('/api/tasks/:id', auth, async (req, res) => {
  const { id } = req.params
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  await db.run(
    `UPDATE tasks SET 
      title = COALESCE(?, title), 
      description = COALESCE(?, description), 
      status = COALESCE(?, status),
      priority = COALESCE(?, priority), 
      due_date = COALESCE(?, due_date), 
      estimate = COALESCE(?, estimate), 
      spent = COALESCE(?, spent),
      updated_at = CURRENT_TIMESTAMP,
      completed_at = CASE WHEN ? = 'done' THEN CURRENT_TIMESTAMP ELSE completed_at END
     WHERE id = ? AND user_id = ?`,
    [title, description, status, priority, dueDate, estimate, spent, status, id, req.user.id]
  )
  const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id])
  if (!task) return res.status(404).json({ error: 'Not found' })
  res.json(task)
})

app.delete('/api/tasks/:id', auth, async (req, res) => {
  const { id } = req.params
  const result = await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id])
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

// Metrics (protected per-user)
app.get('/api/metrics/velocity', auth, async (req, res) => {
  const { days = 7 } = req.query
  const result = await db.all(
    `WITH RECURSIVE dates(d) AS (
      SELECT date('now', '-' || (? - 1) || ' days')
      UNION ALL
      SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
    )
    SELECT 
      strftime('%w', d) AS day_num,
      CASE strftime('%w', d)
        WHEN '0' THEN 'Sun'
        WHEN '1' THEN 'Mon'
        WHEN '2' THEN 'Tue'
        WHEN '3' THEN 'Wed'
        WHEN '4' THEN 'Thu'
        WHEN '5' THEN 'Fri'
        WHEN '6' THEN 'Sat'
      END AS day,
      COALESCE(cnt, 0) AS done
    FROM dates
    LEFT JOIN (
      SELECT date(completed_at) AS task_date, COUNT(*) AS cnt
      FROM tasks 
      WHERE completed_at IS NOT NULL AND user_id = ?
      GROUP BY date(completed_at)
    ) t ON date(d) = task_date
    ORDER BY d`,
    [days, req.user.id]
  )
  res.json(result)
})

app.get('/api/metrics/focus', auth, async (req, res) => {
  const result = await db.all(
    `WITH RECURSIVE dates(d) AS (
      SELECT date('now', '-6 days')
      UNION ALL
      SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
    )
    SELECT 
      strftime('%w', d) AS day_num,
      CASE strftime('%w', d)
        WHEN '0' THEN 'Sun'
        WHEN '1' THEN 'Mon'
        WHEN '2' THEN 'Tue'
        WHEN '3' THEN 'Wed'
        WHEN '4' THEN 'Thu'
        WHEN '5' THEN 'Fri'
        WHEN '6' THEN 'Sat'
      END AS day,
      COALESCE(SUM(minutes), 0) AS minutes
    FROM dates
    LEFT JOIN focus_sessions f ON date(f.day) = date(d) AND f.user_id = ?
    GROUP BY d
    ORDER BY d`,
     [req.user.id]
  )
  res.json(result)
})

app.post('/api/achievements/check', auth, async (req, res) => {
  // Placeholder for achievement checking logic
  res.json({ checked: true })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})