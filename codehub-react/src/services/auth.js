import { api } from './api.js'

export async function login(email, password) {
  const response = await api.post('/api/login', { email, password })
  
  if (response.token) {
    localStorage.setItem('codehub_token', response.token)
    localStorage.setItem('codehub_user', JSON.stringify(response.user))
  }
  
  return response
}

export async function register(username, email, password) {
  const response = await api.post('/api/register', { name: username, email, password })
  return response
}

export function logout() {
  localStorage.removeItem('codehub_token')
  localStorage.removeItem('codehub_user')
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem('codehub_user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    localStorage.removeItem('codehub_user')
    return null
  }
}

export function getToken() {
  return localStorage.getItem('codehub_token')
}
