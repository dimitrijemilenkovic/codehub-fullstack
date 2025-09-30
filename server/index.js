import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// Routes
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import snippetRoutes from './routes/snippetRoutes.js'
import metricRoutes from './routes/metricRoutes.js'
import focusRoutes from './routes/focusRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', async (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api/focus-sessions', focusRoutes)
app.use('/api/achievements', achievementRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`🚀 API listening on http://localhost:${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})
