import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set')
      return res.status(500).json({ error: 'Server configuration error' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    res.status(401).json({ error: 'Authentication failed' })
  }
}
