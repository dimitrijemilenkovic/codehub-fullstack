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
        // Handle 204/205 with no body gracefully
        if (response.status === 204 || response.status === 205) {
          return null
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      // Avoid parsing JSON for 204/205 responses
      if (response.status === 204 || response.status === 205) {
        return null
      }
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await response.json()
      }
      // For non-JSON responses, return raw text
      return await response.text()
    } catch (error) {
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
