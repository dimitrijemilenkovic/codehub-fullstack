import { pool } from '../config/database.js'

export class SnippetService {
  static async getAll(userId, search = null) {
    let query = 'SELECT * FROM snippets WHERE user_id=$1 ORDER BY created_at DESC'
    let params = [userId]
    if (search) {
      query = `SELECT * FROM snippets WHERE user_id=$1 AND (LOWER(title) LIKE $2 OR LOWER(code) LIKE $2) ORDER BY created_at DESC`
      params = [userId, `%${search.toLowerCase()}%`]
    }
    const result = await pool.query(query, params)
    return result.rows
  }

  static async create(userId, { title, code, language, tags }) {
    const result = await pool.query(
      `INSERT INTO snippets(user_id, title, code, language, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title || 'Snippet', code || '', language || 'javascript', tags || []]
    )
    return result.rows[0]
  }

  static async update(userId, id, { title, code, language, tags }) {
    const result = await pool.query(
      `UPDATE snippets
       SET title=COALESCE($3,title), code=COALESCE($4,code), language=COALESCE($5,language), tags=COALESCE($6,tags), updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
      [id, userId, title, code, language, tags]
    )
    if (result.rowCount === 0) throw new Error('Not found')
    return result.rows[0]
  }

  static async delete(userId, id) {
    const result = await pool.query('DELETE FROM snippets WHERE id=$1 AND user_id=$2', [id, userId])
    if (result.rowCount === 0) throw new Error('Not found')
    return true
  }
}
