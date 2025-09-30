import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VelocityChart from '../charts/VelocityChart.jsx'
import ProgressChart from '../charts/ProgressChart.jsx'
import QuickActions from '../components/QuickActions.jsx'
import Achievements from '../components/Achievements.jsx'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

function MiniCalendar() {
  const [currentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthNames = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", 
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"]
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Ponedeljak = 0

  const days = []
  
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <div className="card mini-calendar" style={{ padding: '32px' }}>
      <h3 style={{ fontWeight: 700, marginBottom: '20px', textAlign: 'center', fontSize: '1.25rem' }}>
        📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h3>
      
      {/* Dani u nedelji */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '8px', 
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        {['P', 'U', 'S', 'Č', 'P', 'S', 'N'].map(day => (
          <div key={day} style={{ 
            fontWeight: 600, 
            color: 'var(--color-gray-500)', 
            fontSize: '0.875rem',
            padding: '8px 0'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Kalendar grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px' 
      }}>
        {days.map((day, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: day ? 'pointer' : 'default',
              backgroundColor: day ? (isToday(day) ? 'var(--color-brand-600)' : 'transparent') : 'transparent',
              color: day ? (isToday(day) ? 'white' : 'var(--color-gray-700)') : 'transparent',
              fontWeight: isToday(day) ? 600 : 400,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              if (day) {
                setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
              }
            }}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard(){
  usePageTitle('Dashboard')
  const [velocity, setVelocity] = useState([])
  const [focus, setFocus] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    doing: 0,
    done: 0
  })
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalSnippets: 0,
    pomodoroSessions: 0,
    currentStreak: 1
  })
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    let mounted = true
    async function load(){
      try {
        const [v, f, tasks, snippets] = await Promise.all([
          api.get('/api/metrics/velocity?days=7'),
          api.get('/api/metrics/focus'),
          api.get('/api/tasks'),
          api.get('/api/snippets')
        ])
        if (mounted){
          setVelocity(v)
          setFocus(f)
          
          const counts = {
            todo: tasks.filter(t => t.status === 'todo').length,
            doing: tasks.filter(t => t.status === 'doing').length,
            done: tasks.filter(t => t.status === 'done').length
          }
          setTaskCounts(counts)
          
          setStats({
            totalTasks: tasks.length,
            completedTasks: counts.done,
            totalSnippets: snippets.length,
            pomodoroSessions: Math.floor(Math.random() * 10), // Mock data
            currentStreak: Math.floor(Math.random() * 7) + 1 // Mock data
          })
        }
      } catch (e) {
        console.error('Failed to load metrics', e)
        if (mounted) {
          setVelocity([])
          setFocus([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  function handleStatClick(statType) {
    navigate('/tasks', { state: { filter: statType } })
  }

  async function handleTaskAdded(newTask) {
    try {
      const tasks = await api.get('/api/tasks')
      const counts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        doing: tasks.filter(t => t.status === 'doing').length,
        done: tasks.filter(t => t.status === 'done').length
      }
      setTaskCounts(counts)
      setStats(prev => ({
        ...prev,
        totalTasks: tasks.length,
        completedTasks: counts.done
      }))
    } catch (e) {
      console.error('Failed to reload tasks', e)
    }
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: toast.type === 'success' ? 'var(--color-green-600)' : 'var(--color-red-600)',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontWeight: 500
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Header */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--color-gray-900)',
                marginBottom: '8px'
              }}>
                Dobrodošli nazad! 👋
              </h1>
              <p style={{ 
                margin: 0, 
                color: 'var(--color-gray-600)', 
                fontSize: '1.125rem' 
              }}>
                Evo pregleda vašeg napretka danas
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/pomodoro')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🍅 Pomodoro
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/tasks')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ➕ Novi Task
              </button>
            </div>
          </div>

          <QuickActions onTaskAdded={handleTaskAdded} />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div 
            className="card stat-card" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-gray-200)'
            }}
            onClick={() => handleStatClick('todo')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--color-orange-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📝
              </div>
              <span style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--color-orange-600)' 
              }}>
                {taskCounts.todo}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
              To-Do
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              Čekaju da se urade
            </p>
          </div>

          <div 
            className="card stat-card" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-gray-200)'
            }}
            onClick={() => handleStatClick('doing')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--color-blue-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ⚡
              </div>
              <span style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--color-blue-600)' 
              }}>
                {taskCounts.doing}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
              U radu
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              Trenutno se rade
            </p>
          </div>

          <div 
            className="card stat-card" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-gray-200)'
            }}
            onClick={() => handleStatClick('done')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--color-green-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✅
              </div>
              <span style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--color-green-600)' 
              }}>
                {taskCounts.done}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
              Završeno
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              Uspešno završeno
            </p>
          </div>

          <div className="card stat-card" style={{ 
            padding: '24px',
            border: '1px solid var(--color-gray-200)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--color-purple-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📚
              </div>
              <span style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--color-purple-600)' 
              }}>
                {stats.totalSnippets}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
              Snippets
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              Sačuvani kodovi
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          <MiniCalendar />
          
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.25rem' }}>
              📊 Statistike
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gray-600)' }}>Ukupno taskova:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{stats.totalTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gray-600)' }}>Završeno:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-green-600)' }}>{stats.completedTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gray-600)' }}>Pomodoro sesije:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-orange-600)' }}>{stats.pomodoroSessions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gray-600)' }}>Trenutni streak:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-blue-600)' }}>{stats.currentStreak} dana</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px' 
        }}>
          <div className="card" style={{ 
            width: '100%',
            padding: '0',
            border: '1px solid var(--color-gray-200)'
          }}>
            {stats.totalTasks > 0 ? (
              <VelocityChart data={velocity} loading={loading} />
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '350px',
                width: '100%'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
                <h3 style={{ 
                  fontWeight: 700, 
                  marginBottom: '8px', 
                  fontSize: '1.375rem',
                  color: 'var(--color-gray-700)'
                }}>
                  Nemate nijedan task u listi
                </h3>
                <p style={{ 
                  color: 'var(--color-gray-500)', 
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Dodajte prvi task da vidite grafikon završenih taskova
                </p>
              </div>
            )}
          </div>
          
          <div className="card" style={{ 
            width: '100%',
            padding: '0',
            border: '1px solid var(--color-gray-200)'
          }}>
            <ProgressChart data={focus} loading={loading} />
          </div>
        </div>

        <div className="card achievement-enhanced" style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '1px solid #f59e0b',
          padding: '32px'
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 Achievements
          </h2>
          <Achievements stats={stats} />
        </div>
      </div>
    </>
  )
}
