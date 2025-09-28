import { TaskService } from '../services/taskService.js'
import { AchievementService } from '../services/achievementService.js'

export async function getTasks(req, res) {
  try {
    const userId = req.user.id
    const tasks = await TaskService.getTasks(userId)
    res.json(tasks)
  } catch (error) {
    console.error('Error getting tasks:', error)
    res.status(500).json({ error: 'Failed to get tasks' })
  }
}

export async function createTask(req, res) {
  try {
    const userId = req.user.id
    const task = await TaskService.createTask(userId, req.body)
    
    // Check for new achievements and return them
    const achievementResult = await AchievementService.checkAchievements(userId)
    
    res.status(201).json({
      task,
      newAchievements: achievementResult.newAchievements
    })
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
}

export async function updateTask(req, res) {
  try {
    const userId = req.user.id
    const taskId = req.params.id
    const task = await TaskService.updateTask(userId, taskId, req.body)
    res.json(task)
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' })
    }
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
}

export async function deleteTask(req, res) {
  try {
    const userId = req.user.id
    const taskId = req.params.id
    const task = await TaskService.deleteTask(userId, taskId)
    res.json(task)
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' })
    }
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
}
