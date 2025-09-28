import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = 'dev-secret'

// In-memory storage
const users = []
const tasks = []
const snippets = []

// Create default admin user
const adminPassword = bcrypt.hashSync('admin', 10)
users.push({
  id: '1',
  username: 'admin',
  email: 'admin@admin.com',
  password_hash: adminPassword
})

function auth(req, res, next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Unauthorized' })
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email, username: payload.username }
    next()
  }catch(e){
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// Auth
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Popuni sva polja' })
  
  // Check if email exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email već postoji' })
  }
  
  const password_hash = await bcrypt.hash(password, 10)
  const newUser = {
    id: String(users.length + 1),
    username: name,
    email,
    password_hash
  }
  users.push(newUser)
  
  res.json({ 
    ok: true, 
    user: { 
      id: newUser.id, 
      username: newUser.username, 
      email: newUser.email 
    } 
  })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Prazna polja' })
  
  const user = users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Neispravni kredencijali' })
  
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Neispravni kredencijali' })
  
  const token = jwt.sign({ sub: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    } 
  })
})

// Snippets (protected)
app.get('/api/snippets', auth, (req, res) => {
  const userSnippets = snippets.filter(s => s.user_id === req.user.id)
  res.json(userSnippets)
})

app.post('/api/snippets', auth, (req, res) => {
  const { title, code, language, tags } = req.body || {}
  const newSnippet = {
    id: String(snippets.length + 1),
    user_id: req.user.id,
    title: title || 'Snippet',
    code: code || '',
    language: language || 'javascript',
    tags: tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  snippets.push(newSnippet)
  res.status(201).json(newSnippet)
})

app.put('/api/snippets/:id', auth, (req, res) => {
  const { id } = req.params
  const { title, code, language, tags } = req.body || {}
  
  const snippetIndex = snippets.findIndex(s => s.id === id && s.user_id === req.user.id)
  if (snippetIndex === -1) return res.status(404).json({ error: 'Not found' })
  
  snippets[snippetIndex] = {
    ...snippets[snippetIndex],
    ...(title && { title }),
    ...(code && { code }),
    ...(language && { language }),
    ...(tags && { tags }),
    updated_at: new Date().toISOString()
  }
  
  res.json(snippets[snippetIndex])
})

app.delete('/api/snippets/:id', auth, (req, res) => {
  const { id } = req.params
  const index = snippets.findIndex(s => s.id === id && s.user_id === req.user.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  
  snippets.splice(index, 1)
  res.status(204).end()
})

// Tasks (protected)
app.get('/api/tasks', auth, (req, res) => {
  const userTasks = tasks.filter(t => t.user_id === req.user.id)
  res.json(userTasks)
})

app.post('/api/tasks', auth, (req, res) => {
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  const newTask = {
    id: String(tasks.length + 1),
    user_id: req.user.id,
    title: title || 'Bez naslova',
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    due_date: dueDate || null,
    estimate: Number(estimate || 0),
    spent: Number(spent || 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  }
  tasks.push(newTask)
  res.status(201).json(newTask)
})

app.put('/api/tasks/:id', auth, (req, res) => {
  const { id } = req.params
  const { title, description, status, priority, dueDate, estimate, spent } = req.body || {}
  
  const taskIndex = tasks.findIndex(t => t.id === id && t.user_id === req.user.id)
  if (taskIndex === -1) return res.status(404).json({ error: 'Not found' })
  
  const wasCompleted = tasks[taskIndex].status !== 'done' && status === 'done'
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(dueDate !== undefined && { due_date: dueDate }),
    ...(estimate !== undefined && { estimate: Number(estimate) }),
    ...(spent !== undefined && { spent: Number(spent) }),
    updated_at: new Date().toISOString(),
    ...(wasCompleted && { completed_at: new Date().toISOString() })
  }
  
  res.json(tasks[taskIndex])
})

app.delete('/api/tasks/:id', auth, (req, res) => {
  const { id } = req.params
  const index = tasks.findIndex(t => t.id === id && t.user_id === req.user.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  
  tasks.splice(index, 1)
  res.status(204).end()
})

// Metrics (protected per-user)
app.get('/api/metrics/velocity', auth, (req, res) => {
  // Generate mock data for last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const result = []
  
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7
    result.push({
      day: days[dayIndex === 0 ? 6 : dayIndex - 1],
      done: Math.floor(Math.random() * 5)
    })
  }
  
  res.json(result)
})

app.get('/api/metrics/focus', auth, (req, res) => {
  // Generate mock data for last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const result = []
  
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7
    result.push({
      day: days[dayIndex === 0 ? 6 : dayIndex - 1],
      minutes: Math.floor(Math.random() * 240)
    })
  }
  
  res.json(result)
})

app.post('/api/achievements/check', auth, (req, res) => {
  res.json({ checked: true })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`Demo credentials - Email: admin@admin.com, Password: admin`)
})