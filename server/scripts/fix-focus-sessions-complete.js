import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  user: process.env.PGUSER || 'codehub',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'codehub_db',
  password: process.env.PGPASSWORD || 'codehub_pass',
  port: process.env.PGPORT || 5432,
})

async function fixFocusSessionsComplete() {
  try {
    console.log('Fixing focus_sessions table completely...')

    // Drop and recreate the table to ensure it has all required columns
    await pool.query(`DROP TABLE IF EXISTS focus_sessions CASCADE`)

    await pool.query(`
      CREATE TABLE focus_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        duration_minutes INTEGER NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Add some sample data
    await pool.query(`
      INSERT INTO focus_sessions (duration_minutes, user_id, created_at)
      VALUES 
        (25, (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1), NOW() - INTERVAL '1 day'),
        (30, (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1), NOW() - INTERVAL '2 days'),
        (20, (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1), NOW() - INTERVAL '3 days'),
        (45, (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1), NOW() - INTERVAL '4 days'),
        (25, (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1), NOW() - INTERVAL '5 days')
    `)

    console.log('Focus sessions table recreated successfully with sample data!')

  } catch (error) {
    console.error('Error fixing focus_sessions table:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

fixFocusSessionsComplete()
