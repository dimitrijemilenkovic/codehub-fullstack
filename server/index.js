import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './config/database.js'
import { auth } from './middleware/auth.js'
import authRoutes from './routes/authRoutes.js'
import snippetRoutes from './routes/snippetRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import metricRoutes from './routes/metricRoutes.js'
import focusRoutes from './routes/focusRoutes.js'

const app = express()

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api/focus-sessions', focusRoutes)


const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
}) 