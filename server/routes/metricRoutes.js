import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { velocity, focus } from '../controllers/metricController.js'

const router = Router()
router.get('/velocity', auth, velocity)
router.get('/focus', auth, focus)
export default router
