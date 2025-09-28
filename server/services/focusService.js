import { pool } from '../config/database.js'

export const createFocusSession = async (userId, minutes, date) => {
  const result = await pool.query(
    'INSERT INTO focus_sessions (user_id, duration_minutes, created_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, minutes, date ? new Date(date) : new Date()]
  )
  return result.rows[0]
}

export const getFocusSessions = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}
