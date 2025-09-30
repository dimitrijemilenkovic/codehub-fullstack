import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Pomodoro() {
  usePageTitle('Pomodoro Timer')
  
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const accumulatedTimeRef = useRef(0)

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState')
    if (savedState) {
      const state = JSON.parse(savedState)
      setTimeLeft(state.timeLeft)
      setIsRunning(state.isRunning)
      setIsBreak(state.isBreak)
      setSessionCount(state.sessionCount)
      setTotalMinutes(state.totalMinutes)
      setSelectedDuration(state.selectedDuration)
      setBreakDuration(state.breakDuration)
      setIsActive(state.isActive)
      accumulatedTimeRef.current = state.accumulatedTime || 0
      
      if (state.isRunning && state.startTime) {
        startTimeRef.current = new Date(state.startTime)
        // Calculate elapsed time since last start
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
        const newTimeLeft = Math.max(0, state.timeLeft - elapsed)
        setTimeLeft(newTimeLeft)
        
        // If time is up, trigger session complete
        if (newTimeLeft <= 0) {
          handleSessionComplete()
        }
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    const state = {
      timeLeft,
      isRunning,
      isBreak,
      sessionCount,
      totalMinutes,
      selectedDuration,
      breakDuration,
      isActive,
      accumulatedTime: accumulatedTimeRef.current,
      startTime: startTimeRef.current?.getTime()
    }
    localStorage.setItem('pomodoroState', JSON.stringify(state))
  }, [timeLeft, isRunning, isBreak, sessionCount, totalMinutes, selectedDuration, breakDuration, isActive])

  const handleSessionComplete = useCallback(async () => {    setIsRunning(false)
    clearInterval(intervalRef.current)
    
    if (!isBreak) {
      // Work session completed - save to backend
      const minutes = selectedDuration      
      try {
        const response = await api.post('/api/focus-sessions', {
          minutes: minutes
        })      } catch (e) {      }
      
      // Update local stats
      setTotalMinutes(prev => prev + minutes)
      setSessionCount(prev => prev + 1)
      accumulatedTimeRef.current += minutes
      
      // Start break automatically      setIsBreak(true)
      setTimeLeft(breakDuration * 60)
      
      // Auto-start break timer
      setTimeout(() => {        setIsRunning(true)
        startTimeRef.current = new Date()
      }, 1000) // Small delay to ensure state is updated
      
    } else {
      // Break completed, start new work session      setIsBreak(false)
      setTimeLeft(selectedDuration * 60)
      // Don't auto-start work session, let user decide
    }
  }, [isBreak, selectedDuration, breakDuration])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, handleSessionComplete])

  function startTimer() {    setIsRunning(true)
    setIsActive(true)
    startTimeRef.current = new Date()
  }

  function pauseTimer() {    setIsRunning(false)
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
      accumulatedTimeRef.current += elapsed
    }
  }

  function resetTimer() {    setIsRunning(false)
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(selectedDuration * 60)
    startTimeRef.current = null
    accumulatedTimeRef.current = 0
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isBreak 
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontWeight: 700, 
          marginBottom: '32px',
          color: isBreak ? 'var(--color-green-600)' : 'var(--color-brand-600)',
          fontSize: '2.5rem'
        }}>
          {isBreak ? '☕ Pauza' : '🍅 Pomodoro Timer'}
        </h1>

        {/* Timer Display */}
        <div style={{ 
          fontSize: '6rem', 
          fontWeight: 800, 
          marginBottom: '32px',
          color: isBreak ? 'var(--color-green-600)' : 'var(--color-brand-600)',
          fontFamily: 'monospace',
          textShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: 'var(--color-gray-200)', 
          borderRadius: '4px',
          marginBottom: '32px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: isBreak ? 'var(--color-green-600)' : 'var(--color-brand-600)',
            transition: 'width 1s ease',
            borderRadius: '4px'
          }} />
        </div>

        {/* Duration Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-gray-700)' }}>
            Trajanje sesije
          </h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[5, 10, 25].map(duration => (
              <button
                key={duration}
                onClick={() => {
                  if (!isRunning) {
                    setSelectedDuration(duration)
                    if (!isBreak) {
                      setTimeLeft(duration * 60)
                    }
                  }
                }}
                className={`btn ${selectedDuration === duration ? 'btn-primary' : 'btn-outline'}`}
                disabled={isRunning}
                style={{ minWidth: '60px' }}
              >
                {duration}min
              </button>
            ))}
          </div>
        </div>

        {/* Break Duration Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-gray-700)' }}>
            Trajanje pauze
          </h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[5, 10, 15].map(duration => (
              <button
                key={duration}
                onClick={() => {
                  if (!isRunning) {
                    setBreakDuration(duration)
                    if (isBreak) {
                      setTimeLeft(duration * 60)
                    }
                  }
                }}
                className={`btn ${breakDuration === duration ? 'btn-primary' : 'btn-outline'}`}
                disabled={isRunning}
                style={{ minWidth: '60px' }}
              >
                {duration}min
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button onClick={startTimer} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '12px 24px' }}>
              ▶️ Start
            </button>
          ) : (
            <button onClick={pauseTimer} className="btn btn-secondary" style={{ fontSize: '1.2rem', padding: '12px 24px' }}>
              ⏸️ Pause
            </button>
          )}
          <button onClick={resetTimer} className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '12px 24px' }}>
            🔄 Reset
          </button>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '20px',
          marginTop: '32px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'var(--color-gray-50)', 
            borderRadius: '12px',
            border: '1px solid var(--color-gray-200)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-brand-600)' }}>
              {sessionCount}
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
              Završene sesije
            </div>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'var(--color-gray-50)', 
            borderRadius: '12px',
            border: '1px solid var(--color-gray-200)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-green-600)' }}>
              {totalMinutes}
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
              Ukupno minuta
            </div>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'var(--color-gray-50)', 
            borderRadius: '12px',
            border: '1px solid var(--color-gray-200)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-orange-600)' }}>
              {isActive ? '🟢' : '🔴'}
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
              Status
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          backgroundColor: 'var(--color-gray-50)', 
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)'
        }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--color-gray-800)' }}>
            📋 Kako koristiti Pomodoro Timer
          </h3>
          <ul style={{ textAlign: 'left', color: 'var(--color-gray-700)', lineHeight: '1.6' }}>
            <li>Izaberi trajanje radne sesije (5, 10 ili 25 minuta)</li>
            <li>Izaberi trajanje pauze (5, 10 ili 15 minuta)</li>
            <li>Klikni "Start" da počneš radnu sesiju</li>
            <li>Kada se sesija završi, automatski počinje pauza (zelena boja)</li>
            <li>Timer se čuva čak i kada menjaš stranice</li>
            <li>Svi minuti se automatski šalju na backend</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
