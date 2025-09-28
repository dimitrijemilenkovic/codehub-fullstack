import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { pool } from './config/database.js'
import { apiLimiter, authLimiter, createLimiter } from './middleware/rateLimiter.js'

const app = express()

// Configure CORS for production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Apply general rate limiting to all routes
app.use('/api/', apiLimiter)

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
if (!JWT_SECRET || JWT_SECRET === 'dev-secret') {
  console.warn('WARNING: Using default JWT_SECRET. Please set JWT_SECRET environment variable for production.')
}

function auth(req, res, next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Unauthorized' })
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email, name: payload.name }
    next()
  }catch(e){
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Auth
app.post('/api/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Popuni sva polja' })
  const password_hash = await bcrypt.hash(password, 10)
  const result = await pool.query(
    `INSERT INTO users(name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
     RETURNING id, name, email`,
    [name, email, password_hash]
  )
  res.json({ ok: true, user: result.rows[0] })
})

app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Prazna polja' })
  const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email=$1', [email])
  if (result.rowCount === 0) return res.status(401).json({ error: 'Neispravni kredencijali' })
  const user = result.rows[0]
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Neispravni kredencijali' })
  const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// Snippets (protected)
app.get('/api/snippets', auth, async (req, res) => {
  const { q } = req.query
  let query = 'SELECT * FROM snippets WHERE user_id=$1 ORDER BY created_at DESC'
  let params = [req.user.id]
  if (q) {
    query = `SELECT * FROM snippets WHERE user_id=$1 AND (LOWER(title) LIKE $2 OR LOWER(code) LIKE $2) ORDER BY created_at DESC`
    params = [req.user.id, `%${String(q).toLowerCase()}%`]
  }
  const result = await pool.query(query, params)
  res.json(result.rows)
})

app.post('/api/snippets', auth, async (req, res) => {
  const { title, code, language, tags } = req.body || {}
  const result = await pool.query(
    `INSERT INTO snippets(user_id, title, code, language, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.user.id, title || 'Snippet', code || '', language || 'javascript', tags || []]
  )
  res.status(201).json(result.rows[0])
})

app.put('/api/snippets/:id', auth, async (req, res) => {
  const { id } = req.params
  const { title, code, language, tags } = req.body || {}
  const result = await pool.query(
    `UPDATE snippets
     SET title=COALESCE($3,title), code=COALESCE($4,code), language=COALESCE($5,language), tags=COALESCE($6,tags), updated_at=NOW()
     WHERE id=$1 AND user_id=$2
     RETURNING *`,
    [id, req.user.id, title, code, language, tags]
  )
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json(result.rows[0])
})

app.delete('/api/snippets/:id', auth, async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM snippets WHERE id=$1 AND user_id=$2', [id, req.user.id])
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

// Tasks (protected)
app.get('/api/tasks', auth, async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
  res.json(result.rows)
})

app.post('/api/tasks', auth, async (req, res) => {
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  const result = await pool.query(
    `INSERT INTO tasks(user_id, title, description, status, priority, due_date, estimate, spent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.user.id, title || 'Bez naslova', description || '', status || 'todo', priority || 'medium', dueDate || null, Number(estimate || 0), Number(spent || 0)]
  )
  res.status(201).json(result.rows[0])
})

app.put('/api/tasks/:id', auth, async (req, res) => {
  const { id } = req.params
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  const result = await pool.query(
    `UPDATE tasks SET 
      title=COALESCE($3,title), description=COALESCE($4,description), status=COALESCE($5,status),
      priority=COALESCE($6,priority), due_date=COALESCE($7,due_date), estimate=COALESCE($8,estimate), spent=COALESCE($9,spent),
      updated_at=NOW(), completed_at=CASE WHEN $5='done' THEN NOW() ELSE completed_at END
     WHERE id=$1 AND user_id=$2 RETURNING *`,
    [id, req.user.id, title, description, status, priority, dueDate, estimate, spent]
  )
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json(result.rows[0])
})

app.delete('/api/tasks/:id', auth, async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [id, req.user.id])
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

// Metrics (protected per-user)
app.get('/api/metrics/velocity', auth, async (req, res) => {
  const { days = 7 } = req.query
  const result = await pool.query(
    `SELECT to_char(d::date, 'Dy') AS day, COALESCE(cnt,0) AS done
     FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, interval '1 day') AS d
     LEFT JOIN (
       SELECT date_trunc('day', completed_at) AS d, COUNT(*) AS cnt
       FROM tasks WHERE completed_at IS NOT NULL AND user_id=$2
       GROUP BY 1
     ) t ON t.d::date = d::date
     ORDER BY d`,
    [days, req.user.id]
  )
  res.json(result.rows)
})

app.get('/api/metrics/focus', auth, async (req, res) => {
  const result = await pool.query(
    `SELECT to_char(d::date, 'Dy') AS day, COALESCE(SUM(minutes),0) AS minutes
     FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, interval '1 day') AS d
     LEFT JOIN focus_sessions f ON f.day::date = d::date AND f.user_id=$1
     GROUP BY d
     ORDER BY d`,
     [req.user.id]
  )
  res.json(result.rows)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
}) 