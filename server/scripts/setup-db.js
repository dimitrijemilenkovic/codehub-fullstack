import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  user: process.env.PGUSER || 'codehub',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'codehub_db',
  password: process.env.PGPASSWORD || 'codehub_pass',
  port: process.env.PGPORT || 5432,
})

async function setupDatabase() {
  try {
    console.log('Setting up database...')

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Add username column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE
    `)

    // Add email column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE
    `)

    // Add password_hash column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `)

    // Create snippets table with user_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS snippets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        description TEXT,
        tags TEXT[],
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create tasks table with user_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        estimate INTEGER,
        spent INTEGER,
        completed_at TIMESTAMP,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create focus_sessions table with user_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        duration_minutes INTEGER NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, achievement_id)
      )
    `)

    // Add user_id columns if they don't exist (for existing data)
    await pool.query(`
      ALTER TABLE snippets 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
    `)
    await pool.query(`
      ALTER TABLE snippets 
      ADD COLUMN IF NOT EXISTS tags TEXT[]
    `)

    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
    `)

    // Ensure additional columns exist for tasks
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS estimate INTEGER,
      ADD COLUMN IF NOT EXISTS spent INTEGER,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
    `)

    await pool.query(`
      ALTER TABLE focus_sessions 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE
    `)

    // Create demo user if it doesn't exist
    const demoUserResult = await pool.query(`
      SELECT id FROM users WHERE username = 'demo' OR email = 'demo@example.com'
    `)

    let demoUserId
    if (demoUserResult.rows.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('demo123', 10)
      
      const newUserResult = await pool.query(`
        INSERT INTO users (username, email, password_hash)
        VALUES ('demo', 'demo@example.com', $1)
        RETURNING id
      `, [hashedPassword])
      
      demoUserId = newUserResult.rows[0].id
      console.log('Created demo user')
    } else {
      demoUserId = demoUserResult.rows[0].id
    }

    // Backfill user_id for existing data
    await pool.query(`
      UPDATE snippets SET user_id = $1 WHERE user_id IS NULL
    `, [demoUserId])

    await pool.query(`
      UPDATE tasks SET user_id = $1 WHERE user_id IS NULL
    `, [demoUserId])

    await pool.query(`
      UPDATE focus_sessions SET user_id = $1 WHERE user_id IS NULL
    `, [demoUserId])

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)
    `)

    console.log('Database setup completed successfully!')
    console.log('Demo user credentials:')
    console.log('Username: demo')
    console.log('Password: demo123')

  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
