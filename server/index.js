import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pool } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import snippetRoutes from './routes/snippetRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import metricRoutes from './routes/metricRoutes.js'
import focusRoutes from './routes/focusRoutes.js'
import achievementRoutes from './routes/achievementRoutes.js'

const app = express()
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

// Using shared pool and auth middleware from route modules

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Mount modular routes

app.use('/api/auth', authRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api/focus', focusRoutes)
app.use('/api/achievements', achievementRoutes)

// All protected and resource routes are handled in route modules

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
}) 