import { pool } from '../config/database.js'

export class MetricService {
  static async velocity(userId, days = 7) {
    const query = `
      SELECT to_char(ds.d::date, 'Dy') AS day, COALESCE(t.cnt,0) AS done
      FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, interval '1 day') AS ds(d)
      LEFT JOIN (
        SELECT date_trunc('day', updated_at)::date AS task_date, COUNT(*) AS cnt
        FROM tasks WHERE status='done' AND user_id=$2
        GROUP BY 1
      ) t ON t.task_date = ds.d::date
      ORDER BY ds.d
    `
    const result = await pool.query(query, [days, userId])
    return result.rows
  }

  static async focus(userId) {
    const query = `
      SELECT to_char(ds.d::date, 'Dy') AS day, COALESCE(SUM(f.duration_minutes),0) AS minutes
      FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, interval '1 day') AS ds(d)
      LEFT JOIN focus_sessions f ON f.created_at::date = ds.d::date AND f.user_id=$1
      GROUP BY ds.d
      ORDER BY ds.d
    `
    const result = await pool.query(query, [userId])
    return result.rows
  }
}
