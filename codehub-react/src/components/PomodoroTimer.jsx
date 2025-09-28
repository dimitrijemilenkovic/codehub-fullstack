import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api.js'

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      handleSessionComplete()
    }
  }, [timeLeft])

  async function handleSessionComplete() {
    setIsRunning(false)
    
    if (!isBreak) {
      // Work session completed
      const minutes = isBreak ? 5 : 25
      setTotalMinutes(prev => prev + minutes)
      setSessionCount(prev => prev + 1)
      
      // Save focus session to backend
      try {
        await api.post('/api/focus-sessions', {
          minutes: minutes,
          date: new Date().toISOString().split('T')[0]
        })
      } catch (e) {
        console.error('Failed to save focus session:', e)
      }
      
      // Start break
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break
    } else {
      // Break completed, start new work session
      setIsBreak(false)
      setTimeLeft(25 * 60) // 25 minute work session
    }
  }

  function startTimer() {
    setIsRunning(true)
  }

  function pauseTimer() {
    setIsRunning(false)
  }

  function resetTimer() {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(25 * 60)
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <h3 style={{ 
        fontWeight: 700, 
        marginBottom: '16px',
        color: isBreak ? 'var(--color-green-600)' : 'var(--color-brand-600)'
      }}>
        {isBreak ? '☕ Pauza' : '🍅 Pomodoro Timer'}
      </h3>
      
      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 800, 
        marginBottom: '24px',
        color: isBreak ? 'var(--color-green-600)' : 'var(--color-brand-600)',
        fontFamily: 'monospace'
      }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
        {!isRunning ? (
          <button className="btn btn-primary" onClick={startTimer}>
            ▶️ Start
          </button>
        ) : (
          <button className="btn btn-outline" onClick={pauseTimer}>
            ⏸️ Pauza
          </button>
        )}
        <button className="btn btn-outline" onClick={resetTimer}>
          �� Reset
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px',
        fontSize: '0.875rem',
        color: 'var(--color-gray-600)'
      }}>
        <div>
          <div style={{ fontWeight: 600 }}>Sesije</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-600)' }}>
            {sessionCount}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>Ukupno minuta</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green-600)' }}>
            {totalMinutes}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: 'var(--color-gray-50)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: 'var(--color-gray-600)'
      }}>
        💡 {isBreak ? 'Uživaj u pauzi! Vrati se za 5 minuta.' : 'Fokusiraj se na jedan task 25 minuta.'}
      </div>
    </div>
  )
}
