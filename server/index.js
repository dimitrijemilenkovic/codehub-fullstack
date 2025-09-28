import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Import route modules
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import snippetRoutes from './routes/snippetRoutes.js'
import metricRoutes from './routes/metricRoutes.js'
import focusRoutes from './routes/focusRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'

const { Pool } = pkg

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'codehub',
  password: process.env.PGPASSWORD || 'codehub_pass',
  database: process.env.PGDATABASE || 'codehub_db',
})

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function auth(req, res, next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Unauthorized' })
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.id || payload.sub, email: payload.email, username: payload.username || payload.name }
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

// Use route modules
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api/focus', focusRoutes)
app.use('/api/achievements', achievementRoutes)

// Export auth middleware for use in route modules
export { auth }

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
}) 