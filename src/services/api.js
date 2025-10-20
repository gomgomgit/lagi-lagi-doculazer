import { config, apiEndpoints } from '@/config'

// Base API class untuk handling HTTP requests
class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    // Add auth token from Pinia store if available
    try {
      // Dynamic import to avoid circular dependency
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      
      if (authStore.token) {
        defaultOptions.headers.Authorization = `Bearer ${authStore.token}`
      }
    } catch (error) {
      console.warn('Could not access auth store:', error)
      // Fallback to localStorage
      const token = localStorage.getItem('auth_token')
      if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`
      }
    }

    const config = {
      ...defaultOptions,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Handle unauthorized responses
        if (response.status === 401) {
          // Token might be expired, try to logout user
          try {
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.logout()
          } catch (error) {
            console.warn('Could not logout user:', error)
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    })
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    })
  }

  // File upload request
  async upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...options.headers,
      },
    })
  }
}

// Create instance
const apiService = new ApiService()

// Auth API methods
export const authAPI = {
  login: (credentials) => apiService.post(apiEndpoints.login, credentials),
  register: (userData) => apiService.post(apiEndpoints.register, userData),
  logout: () => apiService.post(apiEndpoints.logout),
}

// User API methods
export const userAPI = {
  getProfile: () => apiService.get(apiEndpoints.profile),
  updateProfile: (data) => apiService.put(apiEndpoints.updateProfile, data),
  changePassword: (data) => apiService.post(apiEndpoints.changePassword, data),
}

// Document API methods
export const documentAPI = {
  getDocuments: () => apiService.get(apiEndpoints.documents),
  uploadDocument: (formData) => apiService.upload(apiEndpoints.uploadDocument, formData),
  summarizeDocument: (documentId) => apiService.post(apiEndpoints.summarizeDocument, { documentId }),
}

// Projects API methods
export const projectAPI = {
  fetchProjects: () => apiService.get(apiEndpoints.projects),
  fetchProjectKnowledges: (id) => apiService.get(`${apiEndpoints.projects}/${id}/knowledge`),
}

// Chat API methods
export const chatAPI = {
  sendMessage: (message) => apiService.post(apiEndpoints.chat, { message }),
  getChatHistory: () => apiService.get(apiEndpoints.chatHistory),
}

export default apiService