import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { 
      id: decoded.sub || decoded.id, 
      email: decoded.email, 
      name: decoded.name 
    }
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}
