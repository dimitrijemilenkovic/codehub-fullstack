import express from 'express'
import { getUserAchievements, checkAchievements } from '../controllers/achievementController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

router.get('/', getUserAchievements)
router.post('/check', checkAchievements)

export default router
