import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'codehub',
  password: process.env.PGPASSWORD || 'codehub_pass',
  database: process.env.PGDATABASE || 'codehub_db',
})

export class AchievementService {
  static async getUserAchievements(userId) {
    const query = `
      SELECT achievement_id, unlocked_at 
      FROM achievements 
      WHERE user_id = $1
    `
    const result = await pool.query(query, [userId])
    return result.rows
  }

  static async unlockAchievement(userId, achievementId) {
    const query = `
      INSERT INTO achievements (user_id, achievement_id, unlocked_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING *
    `
    const result = await pool.query(query, [userId, achievementId])
    return result.rows[0]
  }

  static async checkAchievements(userId) {
    
    // Get user stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'done') as completed_tasks,
        (SELECT COUNT(*) FROM snippets WHERE user_id = $1) as total_snippets,
        (SELECT COUNT(*) FROM focus_sessions WHERE user_id = $1) as pomodoro_sessions
    `
    const statsResult = await pool.query(statsQuery, [userId])
    const stats = {
      total_tasks: parseInt(statsResult.rows[0].total_tasks),
      completed_tasks: parseInt(statsResult.rows[0].completed_tasks),
      total_snippets: parseInt(statsResult.rows[0].total_snippets),
      pomodoro_sessions: parseInt(statsResult.rows[0].pomodoro_sessions)
    }
    

    // Get already unlocked achievements
    const unlockedQuery = `
      SELECT achievement_id FROM achievements WHERE user_id = $1
    `
    const unlockedResult = await pool.query(unlockedQuery, [userId])
    const unlocked = unlockedResult.rows.map(row => row.achievement_id)
    

    // Check for new achievements
    const newAchievements = []
    
    if (stats.total_tasks >= 1 && !unlocked.includes('first_task')) {
      await this.unlockAchievement(userId, 'first_task')
      newAchievements.push('first_task')
    }
    
    if (stats.completed_tasks >= 10 && !unlocked.includes('task_master')) {
      await this.unlockAchievement(userId, 'task_master')
      newAchievements.push('task_master')
    }
    
    if (stats.total_snippets >= 5 && !unlocked.includes('snippet_wizard')) {
      await this.unlockAchievement(userId, 'snippet_wizard')
      newAchievements.push('snippet_wizard')
    }
    
    if (stats.pomodoro_sessions >= 5 && !unlocked.includes('focus_champion')) {
      await this.unlockAchievement(userId, 'focus_champion')
      newAchievements.push('focus_champion')
    }
    
    if (stats.completed_tasks >= 50 && !unlocked.includes('productivity_god')) {
      await this.unlockAchievement(userId, 'productivity_god')
      newAchievements.push('productivity_god')
    }


    return {
      stats,
      newAchievements,
      unlocked: [...unlocked, ...newAchievements]
    }
  }
}
