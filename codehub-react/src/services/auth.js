import { api } from './api.js'

export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password })
  
  if (response.token) {
    localStorage.setItem('codehub_token', response.token)
    localStorage.setItem('codehub_user', JSON.stringify(response.user))
  }
  
  return response
}

export async function register(username, email, password) {
  const response = await api.post('/api/auth/register', { username, email, password })
  return response
}

export function logout() {
  localStorage.removeItem('codehub_token')
  localStorage.removeItem('codehub_user')
}

export function getCurrentUser() {
  const user = localStorage.getItem('codehub_user')
  return user ? JSON.parse(user) : null
}

export function getToken() {
  return localStorage.getItem('codehub_token')
}
