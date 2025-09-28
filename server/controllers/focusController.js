import * as FocusService from '../services/focusService.js'

export const createFocusSession = async (req, res) => {
  try {
    const userId = req.user.id
    const { minutes, date } = req.body
    
    const focusSession = await FocusService.createFocusSession(userId, minutes, date)
    res.status(201).json(focusSession)
  } catch (error) {
    console.error('Error creating focus session:', error)
    res.status(500).json({ error: 'Failed to create focus session' })
  }
}

export const getFocusSessions = async (req, res) => {
  try {
    const userId = req.user.id
    const focusSessions = await FocusService.getFocusSessions(userId)
    res.json(focusSessions)
  } catch (error) {
    console.error('Error getting focus sessions:', error)
    res.status(500).json({ error: 'Failed to get focus sessions' })
  }
}
