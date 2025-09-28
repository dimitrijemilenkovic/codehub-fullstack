import { useSyncExternalStore } from 'react'


const key = 'codehub_token'
const listeners = new Set()


function getSnapshot() { return !!localStorage.getItem(key) }
function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) }


export function useAuth() {
const isAuthed = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
const login = (token = 'dev-token') => { localStorage.setItem(key, token); listeners.forEach(l => l()) }
const logout = () => { localStorage.removeItem(key); listeners.forEach(l => l()) }
return { isAuthed, login, logout }
}