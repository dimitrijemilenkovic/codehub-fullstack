import { MetricService } from '../services/metricService.js'

export async function velocity(req, res) {
  try {
    const userId = req.user.id
    const days = Number(req.query.days || 7)
    const data = await MetricService.velocity(userId, days)
    res.json(data)
  } catch (error) {
    console.error('Error getting velocity metrics:', error)
    res.status(500).json({ error: 'Failed to get velocity metrics' })
  }
}

export async function focus(req, res) {
  try {
    const userId = req.user.id
    const data = await MetricService.focus(userId)
    res.json(data)
  } catch (error) {
    console.error('Error getting focus metrics:', error)
    res.status(500).json({ error: 'Failed to get focus metrics' })
  }
}
