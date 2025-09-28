import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import snippetRoutes from './routes/snippetRoutes.js'
import metricRoutes from './routes/metricRoutes.js'
import focusRoutes from './routes/focusRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'
import { auth } from './middleware/auth.js'

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', auth, taskRoutes)
app.use('/api/snippets', auth, snippetRoutes)
app.use('/api/metrics', auth, metricRoutes)
app.use('/api/focus', auth, focusRoutes)
app.use('/api/achievements', auth, achievementRoutes)


const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
}) 