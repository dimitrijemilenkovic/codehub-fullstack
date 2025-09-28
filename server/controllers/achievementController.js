import { AchievementService } from '../services/achievementService.js'

export async function getUserAchievements(req, res) {
  try {
    const userId = req.user.id
    const achievements = await AchievementService.getUserAchievements(userId)
    res.json(achievements)
  } catch (error) {
    console.error('Error getting user achievements:', error)
    res.status(500).json({ error: 'Failed to get achievements' })
  }
}

export async function checkAchievements(req, res) {
  try {
    const userId = req.user.id
    const result = await AchievementService.checkAchievements(userId)
    res.json(result)
  } catch (error) {
    console.error('Error checking achievements:', error)
    res.status(500).json({ error: 'Failed to check achievements' })
  }
}
