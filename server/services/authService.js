import { pool } from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/index.js'

export class AuthService {
  static async register(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `
    
    const result = await pool.query(query, [username, email, hashedPassword])
    return result.rows[0]
  }

  static async login(email, password) {
    const query = `
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = $1
    `
    
    const result = await pool.query(query, [email])
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials')
    }
    
    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  }
}
