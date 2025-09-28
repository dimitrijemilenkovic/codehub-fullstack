import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  user: process.env.PGUSER || 'codehub',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'codehub_db',
  password: process.env.PGPASSWORD || 'codehub_pass',
  port: process.env.PGPORT || 5432,
})

async function addIndexes() {
  try {
    console.log('Adding performance indexes...')

    // Index for user login (email lookup)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)

    // Index for tasks queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC)
    `)

    // Index for snippets search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_snippets_user_created ON snippets(user_id, created_at DESC)
    `)
    
    // Add GIN index for snippet search
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_snippets_title_gin ON snippets USING gin(title gin_trgm_ops)
    `)

    // Index for focus sessions aggregation
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_created ON focus_sessions(user_id, created_at)
    `)

    console.log('Indexes added successfully!')

  } catch (error) {
    console.error('Error adding indexes:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addIndexes()