import { Router } from 'express'
import { createFocusSession, getFocusSessions } from '../controllers/focusController.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.post('/', auth, createFocusSession)
router.get('/', auth, getFocusSessions)

export default router
