import { AuthService } from '../services/authService.js'

export async function register(req, res) {
  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    
    const user = await AuthService.register(username, email, password)
    res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Email or username already exists' })
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    const result = await AuthService.login(email, password)
    res.json(result)
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({ error: 'Invalid credentials' })
  }
}
