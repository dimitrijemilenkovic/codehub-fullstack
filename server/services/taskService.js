import { pool } from '../config/database.js'
import { AchievementService } from './achievementService.js'

export class TaskService {
  static async getTasks(userId) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `
    const result = await pool.query(query, [userId])
    return result.rows
  }

    static async createTask(userId, taskData) {
    const { title, description = '', status = 'todo', priority = 'medium', due_date } = taskData
    
    const query = `
      INSERT INTO tasks (title, description, status, priority, due_date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    const result = await pool.query(query, [title, description, status, priority, due_date, userId])
    const newTask = result.rows[0]
    
    // Check for new achievements
    try {
      await AchievementService.checkAchievements(userId)
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
    
    return newTask
  }

  static async updateTask(userId, taskId, updates) {
    const { title, description, status, priority, due_date } = updates
    
    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          due_date = COALESCE($5, due_date),
          updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `
    
    const result = await pool.query(query, [title, description, status, priority, due_date, taskId, userId])
    
    if (result.rows.length === 0) {
      throw new Error('Task not found')
    }
    
    const updatedTask = result.rows[0]
    
    // Check for new achievements when task is completed
    if (status === 'done') {
      try {
        await AchievementService.checkAchievements(userId)
      } catch (error) {
        console.error('Error checking achievements:', error)
      }
    }
    
    return updatedTask
  }

  static async deleteTask(userId, taskId) {
    const query = `
      DELETE FROM tasks 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `
    
    const result = await pool.query(query, [taskId, userId])
    
    if (result.rows.length === 0) {
      throw new Error('Task not found')
    }
    
    return result.rows[0]
  }
}
