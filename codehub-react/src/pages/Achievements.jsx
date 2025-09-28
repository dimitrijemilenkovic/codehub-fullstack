import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { api } from '../services/api.js'

const ALL_ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'Prvi korak',
    description: 'Kreirao si svoj prvi task',
    icon: '🎯',
    rarity: 'common',
    tooltip: 'Počni svoju produktivnu putanju kreiranjem prvog taska!',
    howToUnlock: 'Kreiraj svoj prvi task u Tasks sekciji'
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Završio si 10 taskova',
    icon: '👑',
    rarity: 'rare',
    tooltip: 'Dokazao si da možeš da završiš taskove konzistentno!',
    howToUnlock: 'Završi 10 taskova - označi ih kao "Done"'
  },
  {
    id: 'snippet_wizard',
    title: 'Snippet Wizard',
    description: 'Kreirao si 5 snippeta',
    icon: '🧙‍♂️',
    rarity: 'uncommon',
    tooltip: 'Postao si majstor čuvanja korisnih kodova!',
    howToUnlock: 'Kreiraj 5 snippeta u Snippets sekciji'
  },
  {
    id: 'focus_champion',
    title: 'Focus Champion',
    description: 'Završio si 5 Pomodoro sesija',
    icon: '🍅',
    rarity: 'rare',
    tooltip: 'Naučio si da se fokusiraš i održavaš koncentraciju!',
    howToUnlock: 'Završi 5 Pomodoro sesija na Dashboard-u'
  },
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Radio si 3 dana zaredom',
    icon: '🔥',
    rarity: 'epic',
    tooltip: 'Konzistentnost je ključ uspeha - nastavi tako!',
    howToUnlock: 'Koristi aplikaciju 3 dana zaredom'
  },
  {
    id: 'productivity_god',
    title: 'Productivity God',
    description: 'Završio si 50 taskova',
    icon: '⚡',
    rarity: 'legendary',
    tooltip: 'Dostigao si vrhunsku produktivnost - čestitamo!',
    howToUnlock: 'Završi 50 taskova - označi ih kao "Done"'
  },
  {
    id: 'code_collector',
    title: 'Code Collector',
    description: 'Kreirao si 20 snippeta',
    icon: '💎',
    rarity: 'epic',
    tooltip: 'Tvoja kolekcija koda je impresivna!',
    howToUnlock: 'Kreiraj 20 snippeta u Snippets sekciji'
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Završio si 25 Pomodoro sesija',
    icon: '⏰',
    rarity: 'epic',
    tooltip: 'Savladao si umetnost upravljanja vremenom!',
    howToUnlock: 'Završi 25 Pomodoro sesija na Dashboard-u'
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Radio si 7 dana zaredom',
    icon: '👑',
    rarity: 'legendary',
    tooltip: 'Nedeljna konzistentnost - to je pravi uspeh!',
    howToUnlock: 'Koristi aplikaciju 7 dana zaredom'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Završio si 5 taskova u jednom danu',
    icon: '🚀',
    rarity: 'rare',
    tooltip: 'Brza i efikasna - tvoja snaga!',
    howToUnlock: 'Završi 5 taskova u jednom danu'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Radio si posle 22h',
    icon: '🦉',
    rarity: 'uncommon',
    tooltip: 'Noćni rad - za one koji vole da rade u tišini!',
    howToUnlock: 'Koristi aplikaciju posle 22h'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Radio si pre 6h ujutru',
    icon: '🐦',
    rarity: 'uncommon',
    tooltip: 'Rano ustajanje - početak dana je tvoj!',
    howToUnlock: 'Koristi aplikaciju pre 6h ujutru'
  }
]

export default function Achievements() {
  usePageTitle('Achievements')
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAchievements() {
      try {
        const result = await api.get('/api/achievements')
        setUnlockedAchievements(result.map(a => a.achievement_id))
      } catch (e) {
        console.error('Failed to load achievements:', e)
      } finally {
        setLoading(false)
      }
    }
    loadAchievements()
  }, [])

  const unlockedAchievementObjects = ALL_ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id))
  const lockedAchievements = ALL_ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id))

  const rarityColors = {
    common: 'var(--color-gray-400)',
    uncommon: 'var(--color-green-400)',
    rare: 'var(--color-blue-400)',
    epic: 'var(--color-purple-400)',
    legendary: 'var(--color-orange-400)'
  }

  const rarityNames = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary'
  }

  if (loading) {
    return <div className="card">Učitavanje achievement-a...</div>
  }

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Header Stats */}
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '2.5rem', fontWeight: 800 }}>
          🏆 Achievements
        </h1>
        <p style={{ 
          color: 'var(--color-gray-600)', 
          fontSize: '1.125rem',
          marginBottom: '24px'
        }}>
          Achievements se automatski otključavaju kada ispuniš određene uslove. Hoveruj preko achievement-a da vidiš kako da ih osvojiš!
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '24px',
          marginTop: '24px'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-brand-600)' }}>
              {unlockedAchievementObjects.length}
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>
              Otključani
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-gray-400)' }}>
              {ALL_ACHIEVEMENTS.length}
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>
              Ukupno
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-green-600)' }}>
              {Math.round((unlockedAchievementObjects.length / ALL_ACHIEVEMENTS.length) * 100)}%
            </div>
            <div style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>
              Progress
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievementObjects.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ Otključani Achievements
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {unlockedAchievementObjects.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement achievement-${achievement.rarity} achievement-unlocked`}
                title={`${achievement.tooltip}\n\nKako se osvaja: ${achievement.howToUnlock}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  <div 
                    className="achievement-rarity"
                    style={{ color: rarityColors[achievement.rarity] }}
                  >
                    {rarityNames[achievement.rarity]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔒 Zaključani Achievements
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {lockedAchievements.map(achievement => (
            <div 
              key={achievement.id} 
              className="achievement achievement-locked"
              title={`Zaključano - nastavi da radiš da otključaš!\n\nKako se osvaja: ${achievement.howToUnlock}`}
            >
              <div className="achievement-icon">🔒</div>
              <div className="achievement-content">
                <div className="achievement-title">???</div>
                <div className="achievement-description">Zaključano</div>
                <div className="achievement-rarity" style={{ color: 'var(--color-gray-400)' }}>
                  ???
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
