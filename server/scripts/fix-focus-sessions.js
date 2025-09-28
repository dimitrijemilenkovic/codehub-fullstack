import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  user: process.env.PGUSER || 'codehub1',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'codehub_db',
  password: process.env.PGPASSWORD || 'codehub_pass',
  port: process.env.PGPORT || 5432,
})

async function fixFocusSessions() {
  try {
    console.log('Fixing focus_sessions table...')

    // Add created_at column if it doesn't exist
    await pool.query(`
      ALTER TABLE focus_sessions 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `)

    // Update existing records to have created_at
    await pool.query(`
      UPDATE focus_sessions 
      SET created_at = NOW() 
      WHERE created_at IS NULL
    `)

    console.log('Focus sessions table fixed successfully!')

  } catch (error) {
    console.error('Error fixing focus_sessions table:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

fixFocusSessions()
