import { useLocalStorage } from './useLocalStorage.js'


export function useTasks(){
const [tasks, setTasks] = useLocalStorage('codehub_tasks', [])


function add(task){
const now = new Date().toISOString()
const t = {
id: crypto.randomUUID(),
title: task.title?.trim() || 'Bez naslova',
description: task.description || '',
status: task.status || 'todo', // todo | doing | done
priority: task.priority || 'medium', // low | medium | high
dueDate: task.dueDate || null,
estimate: Number(task.estimate || 0),
spent: Number(task.spent || 0),
createdAt: now,
updatedAt: now,
completedAt: null,
}
setTasks(ts => [t, ...ts])
}


function update(id, patch){
const now = new Date().toISOString()
setTasks(ts => ts.map(t => t.id===id ? { ...t, ...patch, updatedAt: now } : t))
}


function remove(id){ setTasks(ts => ts.filter(t => t.id!==id)) }


function setStatus(id, status){
update(id, { status, completedAt: status==='done' ? new Date().toISOString() : null })
}


function statsLastNDays(n=7){
const end = new Date()
const arr = []
for (let i=n-1;i>=0;i--){
const d = new Date(end); d.setDate(d.getDate()-i)
const ymd = d.toISOString().slice(0,10)
const label = d.toLocaleDateString('sr-RS', { weekday: 'short' })
const done = tasks.filter(t => t.completedAt && t.completedAt.slice(0,10) === ymd).length
arr.push({ day: label, done })
}
return arr
}


const counts = {
total: tasks.length,
todo: tasks.filter(t=>t.status==='todo').length,
doing: tasks.filter(t=>t.status==='doing').length,
done: tasks.filter(t=>t.status==='done').length,
}


return { tasks, add, update, remove, setStatus, statsLastNDays, counts }
}