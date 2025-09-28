if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required for security')
  process.exit(1)
}
export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = process.env.PORT || 3001
export const NODE_ENV = process.env.NODE_ENV || 'development'
