import { useState, useEffect } from 'react'
import { api } from '../services/api.js'

const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'Prvi korak',
    description: 'Kreirao si svoj prvi task',
    icon: '🎯',
    rarity: 'common'
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Završio si 10 taskova',
    icon: '👑',
    rarity: 'rare'
  },
  {
    id: 'snippet_wizard',
    title: 'Snippet Wizard',
    description: 'Kreirao si 5 snippeta',
    icon: '🧙‍♂️',
    rarity: 'uncommon'
  },
  {
    id: 'focus_champion',
    title: 'Focus Champion',
    description: 'Završio si 5 Pomodoro sesija',
    icon: '🍅',
    rarity: 'rare'
  },
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Radio si 3 dana zaredom',
    icon: '🔥',
    rarity: 'epic'
  },
  {
    id: 'productivity_god',
    title: 'Productivity God',
    description: 'Završio si 50 taskova',
    icon: '⚡',
    rarity: 'legendary'
  }
]

export default function Achievements({ stats }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [newAchievement, setNewAchievement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAchievements() {
      try {
        const result = await api.post('/api/achievements/check')
        setUnlockedAchievements(result.unlocked || [])
        
        // Show notification for new achievements
        if (result.newAchievements && result.newAchievements.length > 0) {
          const newAchievementData = ACHIEVEMENTS.find(a => a.id === result.newAchievements[0])
          if (newAchievementData) {
            setNewAchievement(newAchievementData)
            setTimeout(() => setNewAchievement(null), 5000)
          }
        }
      } catch (e) {
        console.error('Failed to load achievements:', e)
      } finally {
        setLoading(false)
      }
    }
    
    if (stats) {
      loadAchievements()
    }
  }, [stats])

  const unlockedAchievementObjects = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id))

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '24px' }}>Učitavanje achievement-a...</div>
  }

  return (
    <div>
      {/* Achievement Notification */}
      {newAchievement && (
        <div className="achievement-notification">
          <div className="achievement-notification-content">
            <div className="achievement-notification-icon">{newAchievement.icon}</div>
            <div>
              <div className="achievement-notification-title">Achievement Unlocked!</div>
              <div className="achievement-notification-name">{newAchievement.title}</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '12px' 
      }}>
        {unlockedAchievementObjects.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-mini achievement-${achievement.rarity}`}
            title={`${achievement.title}: ${achievement.description}`}
          >
            <div className="achievement-mini-icon">{achievement.icon}</div>
            <div className="achievement-mini-title">{achievement.title}</div>
          </div>
        ))}
      </div>

      {unlockedAchievementObjects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--color-gray-500)',
          padding: '24px'
        }}>
          Nema otključanih achievement-a. Nastavi da radiš da ih osvojiš! 🎯
        </div>
      )}
    </div>
  )
}
