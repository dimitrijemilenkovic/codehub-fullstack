import pkg from 'pg'
const { Pool } = pkg

// Validate required environment variables
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0 && !process.env.DATABASE_URL) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

export default pool
