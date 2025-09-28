import { useState } from 'react'
import { api } from '../services/api.js'

export default function QuickActions({ onTaskAdded }) {
  const [quickTask, setQuickTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [achievementNotification, setAchievementNotification] = useState(null)

  async function addQuickTask(e) {
    e.preventDefault()
    if (!quickTask.trim()) return
    
    setLoading(true)
    try {
      console.log('Sending task data:', { title: quickTask, status: 'todo', priority: 'medium' });
      const response = await api.post('/api/tasks', { 
        title: quickTask,
        status: 'todo',
        priority: 'medium'
      });
      console.log('Received response:', response);
      
      // Handle response - it might be just the task or an object with task and newAchievements
      const task = response.task || response
      const newAchievements = response.newAchievements || []
      
      onTaskAdded?.(task)
      setQuickTask('')
      
      // Show achievement notification if there are new achievements
      if (newAchievements.length > 0) {
        setAchievementNotification(newAchievements[0]) // Show first achievement
        setTimeout(() => setAchievementNotification(null), 5000) // Hide after 5 seconds
      }
    } catch (e) {
      console.error('Failed to add task:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Achievement Notification */}
      {achievementNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'slideInRight 0.3s ease-out',
          maxWidth: '300px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🏆</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Achievement Unlocked!</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {achievementNotification === 'first_task' && 'Prvi korak - Kreiraj prvi task'}
                {achievementNotification === 'task_master' && 'Task Master - Završi 10 taskova'}
                {achievementNotification === 'snippet_wizard' && 'Snippet Wizard - Kreiraj 5 snippeta'}
                {achievementNotification === 'focus_champion' && 'Focus Champion - Završi 5 Pomodoro sesija'}
                {achievementNotification === 'productivity_god' && 'Productivity God - Završi 50 taskova'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card quick-actions">
        <h3 style={{ fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Brza akcija
        </h3>
        
        <form onSubmit={addQuickTask} style={{ display: 'flex', gap: '12px' }}>
          <input
            className="input"
            placeholder="Dodaj brzi task..."
            value={quickTask}
            onChange={e => setQuickTask(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !quickTask.trim()}
          >
            {loading ? '...' : '➕'}
          </button>
        </form>
      </div>
    </>
  )
}