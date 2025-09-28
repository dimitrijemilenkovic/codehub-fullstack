const API_BASE_URL = 'http://localhost:3001'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('codehub_token')
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    // console.log(`API ${config.method || 'GET'} ${url}`, config.body ? JSON.parse(config.body) : '')

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: response.statusText, message: response.statusText }
        }
        
        // Handle unauthorized errors
        if (response.status === 401) {
          localStorage.removeItem('codehub_token')
          window.location.href = '/login'
        }
        
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }
      
      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return null
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error:', error)
        throw new Error('Network error: Unable to connect to server')
      }
      console.error('API request failed:', error)
      throw error
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
