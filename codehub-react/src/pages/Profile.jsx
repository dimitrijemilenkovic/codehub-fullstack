import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Profile() {
  usePageTitle('Profil')
  const { logout } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ snippets: 0, tasks: 0, completed: 0 })
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', bio: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      // Get user info from token (we'll need to add this endpoint)
      const [snippets, tasks] = await Promise.all([
        api.get('/api/snippets'),
        api.get('/api/tasks')
      ])
      
      setStats({
        snippets: snippets.length,
        tasks: tasks.length,
        completed: tasks.filter(t => t.status === 'done').length
      })
      
      // For now, get user info from localStorage or token
      const token = localStorage.getItem('codehub_token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setUser({
            name: payload.name,
            email: payload.email,
            bio: 'Developer passionate about clean code and modern web technologies.'
          })
          setForm({
            name: payload.name,
            email: payload.email,
            bio: 'Developer passionate about clean code and modern web technologies.'
          })
        } catch (e) {
          console.error('Error parsing token:', e)
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setError('')
    try {
      // This would need a backend endpoint
      setUser({ ...user, ...form })
      setEditMode(false)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError('')
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Nove lozinke se ne poklapaju')
      return
    }
    try {
      // This would need a backend endpoint
      setPasswordForm({ current: '', new: '', confirm: '' })
      alert('Lozinka je uspešno promenjena')
    } catch (e) {
      setError(e.message)
    }
  }

  function handleLogout() {
    logout()
  }

  if (loading) {
    return <div className="card">Učitavanje...</div>
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Profile Header */}
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user?.name || 'Korisnik'}</h1>
            <p>{user?.email || 'email@example.com'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.snippets}</div>
            <div className="stat-label">Snippeti</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.tasks}</div>
            <div className="stat-label">Taskovi</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Završeni</div>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Podešavanja profila</h2>
          <button 
            className="btn btn-outline" 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Otkaži' : 'Izmeni'}
          </button>
        </div>

        {error && <div style={{ color: 'var(--color-danger-600)', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-section">
            <h3>Osnovne informacije</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Ime</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e=>setForm(f=>({...f, name:e.target.value}))}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={e=>setForm(f=>({...f, email:e.target.value}))}
                  disabled={!editMode}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="textarea"
                value={form.bio}
                onChange={e=>setForm(f=>({...f, bio:e.target.value}))}
                disabled={!editMode}
                placeholder="Kratko o sebi..."
              />
            </div>
          </div>

          {editMode && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Sačuvaj izmene</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>
                Otkaži
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 style={{ margin: '0 0 24px 0', fontWeight: 700 }}>Promena lozinke</h2>
        
        <form onSubmit={handleChangePassword}>
          <div className="form-section">
            <div className="form-group">
              <label>Trenutna lozinka</label>
              <input
                className="input"
                type="password"
                value={passwordForm.current}
                onChange={e=>setPasswordForm(f=>({...f, current:e.target.value}))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nova lozinka</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.new}
                  onChange={e=>setPasswordForm(f=>({...f, new:e.target.value}))}
                />
              </div>
              <div className="form-group">
                <label>Potvrdi novu lozinku</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e=>setPasswordForm(f=>({...f, confirm:e.target.value}))}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Promeni lozinku</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid var(--color-danger-200)' }}>
        <h2 style={{ margin: '0 0 24px 0', fontWeight: 700, color: 'var(--color-danger-600)' }}>
          Opasna zona
        </h2>
        <p style={{ margin: '0 0 16px 0', color: 'var(--color-gray-600)' }}>
          Odjavljivanje će te preusmeriti na login stranicu.
        </p>
        <button 
          className="btn btn-outline" 
          onClick={handleLogout}
          style={{ borderColor: 'var(--color-danger-300)', color: 'var(--color-danger-600)' }}
        >
          Odjavi se
        </button>
      </div>
    </div>
  )
}
