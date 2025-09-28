import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
const { Pool } = pkg
// Import auth middleware after pool setup

const app = express()
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'codehub',
  password: process.env.PGPASSWORD || 'codehub_pass',
  database: process.env.PGDATABASE || 'codehub_db',
})

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required for security')
  process.exit(1)
}
const JWT_SECRET = process.env.JWT_SECRET

// Auth middleware function
function auth(req, res, next){
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { 
      id: decoded.sub || decoded.id, 
      email: decoded.email, 
      name: decoded.name 
    }
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Invalid token' })
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
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 100)
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 255)
    
    const password_hash = await bcrypt.hash(password, 12) // Increased from 10 to 12 rounds
    const result = await pool.query(
      `INSERT INTO users(name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [sanitizedName, sanitizedEmail, password_hash]
    )
    res.status(201).json({ ok: true, user: result.rows[0] })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' })
    }
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    // Rate limiting would be implemented here in production
    // For now, we'll add a small delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const sanitizedEmail = email.trim().toLowerCase()
    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email=$1', [sanitizedEmail])
    
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    )
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Snippets (protected)
app.get('/api/snippets', auth, async (req, res) => {
  try {
    const { q } = req.query
    let query = 'SELECT * FROM snippets WHERE user_id=$1 ORDER BY created_at DESC'
    let params = [req.user.id]
    
    if (q) {
      // Sanitize search query to prevent SQL injection
      const sanitizedQuery = String(q).trim().substring(0, 100)
      query = `SELECT * FROM snippets WHERE user_id=$1 AND (LOWER(title) LIKE $2 OR LOWER(code) LIKE $2) ORDER BY created_at DESC`
      params = [req.user.id, `%${sanitizedQuery.toLowerCase()}%`]
    }
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching snippets:', error)
    res.status(500).json({ error: 'Failed to fetch snippets' })
  }
})

app.post('/api/snippets', auth, async (req, res) => {
  try {
    const { title, code, language, tags } = req.body || {}
    
    // Input validation and sanitization
    const sanitizedTitle = (title || 'Snippet').trim().substring(0, 200)
    const sanitizedCode = (code || '').substring(0, 50000) // Limit code size
    const sanitizedLanguage = (language || 'javascript').trim().substring(0, 50)
    const sanitizedTags = Array.isArray(tags) ? tags.slice(0, 10).map(tag => String(tag).trim().substring(0, 50)) : []
    
    const result = await pool.query(
      `INSERT INTO snippets(user_id, title, code, language, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, sanitizedTitle, sanitizedCode, sanitizedLanguage, sanitizedTags]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating snippet:', error)
    res.status(500).json({ error: 'Failed to create snippet' })
  }
})

app.put('/api/snippets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, code, language, tags } = req.body || {}
    
    // Validate ID is a number
    const snippetId = parseInt(id)
    if (isNaN(snippetId)) {
      return res.status(400).json({ error: 'Invalid snippet ID' })
    }
    
    // Sanitize inputs
    const sanitizedTitle = title ? title.trim().substring(0, 200) : null
    const sanitizedCode = code ? code.substring(0, 50000) : null
    const sanitizedLanguage = language ? language.trim().substring(0, 50) : null
    const sanitizedTags = tags && Array.isArray(tags) ? tags.slice(0, 10).map(tag => String(tag).trim().substring(0, 50)) : null
    
    const result = await pool.query(
      `UPDATE snippets
       SET title=COALESCE($3,title), code=COALESCE($4,code), language=COALESCE($5,language), tags=COALESCE($6,tags), updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
      [snippetId, req.user.id, sanitizedTitle, sanitizedCode, sanitizedLanguage, sanitizedTags]
    )
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Snippet not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating snippet:', error)
    res.status(500).json({ error: 'Failed to update snippet' })
  }
})

app.delete('/api/snippets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    
    // Validate ID is a number
    const snippetId = parseInt(id)
    if (isNaN(snippetId)) {
      return res.status(400).json({ error: 'Invalid snippet ID' })
    }
    
    const result = await pool.query('DELETE FROM snippets WHERE id=$1 AND user_id=$2', [snippetId, req.user.id])
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Snippet not found' })
    }
    
    res.status(204).end()
  } catch (error) {
    console.error('Error deleting snippet:', error)
    res.status(500).json({ error: 'Failed to delete snippet' })
  }
})

// Tasks (protected)
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
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