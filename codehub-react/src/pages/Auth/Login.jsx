import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth.js'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-purple-500))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🚀
          </div>
          <h1>Welcome Back</h1>
          <p style={{ 
            color: 'var(--color-gray-600)', 
            margin: '8px 0 0 0',
            fontSize: '0.875rem'
          }}>
            Sign in to your CodeHub account
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
        
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'var(--color-gray-50)', 
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--color-gray-600)',
          textAlign: 'center'
        }}>
          <strong>Demo Account:</strong><br />
          Email: admin@admin.com<br />
          Password: admin
        </div>
      </div>
    </div>
  )
}
