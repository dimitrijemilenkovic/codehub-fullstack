import { pool } from '../config/database.js'

export class MetricService {
  static async velocity(userId, days = 7) {
    const query = `
      SELECT 
        DATE(d.d) AS date,
        COALESCE(t.cnt, 0) AS tasks_completed
      FROM generate_series(NOW() - ($2::int - 1) * INTERVAL '1 day', NOW(), INTERVAL '1 day') AS d(d)
      LEFT JOIN (
        SELECT DATE(completed_at) AS day, COUNT(*) AS cnt
        FROM tasks
        WHERE user_id = $1 AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
      ) t ON t.day = DATE(d.d)
      ORDER BY DATE(d.d)
    `
    const result = await pool.query(query, [userId, Number(days)])
    return result.rows
  }

    static async focus(userId) {
    const query = `
      SELECT 
        d.d::date AS date,
        COALESCE(SUM(fs.duration_minutes), 0) AS total_minutes
      FROM generate_series(NOW() - INTERVAL '6 days', NOW(), '1 day') AS d(d)
      LEFT JOIN focus_sessions fs ON fs.user_id = $1 AND fs.created_at::date = d.d::date
      GROUP BY d.d
      ORDER BY d.d
    `
    
    try {
      const result = await pool.query(query, [userId])
      return result.rows
    } catch (error) {
      console.error('Focus metrics error:', error)
      // Return empty data for last 7 days on error
      const emptyData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        emptyData.push({
          date: date.toISOString().split('T')[0],
          total_minutes: 0
        })
      }
      return emptyData
    }
  }
}
