import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'codehub',
  password: process.env.PGPASSWORD || 'codehub_pass',
  database: process.env.PGDATABASE || 'codehub_db',
})

export default pool
