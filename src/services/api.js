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
      headers: {},
    }

    // Only add Content-Type for non-upload requests
    if (!options.isUpload) {
      defaultOptions.headers['Content-Type'] = 'application/json'
    }

    // Add any custom headers
    if (options.headers) {
      Object.assign(defaultOptions.headers, options.headers)
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
      headers: defaultOptions.headers, // Ensure headers are properly set
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
    // For file uploads, mark as upload and don't set Content-Type
    const uploadOptions = {
      method: 'POST',
      body: formData,
      isUpload: true, // Flag to prevent Content-Type being set
      headers: {
        ...options.headers,
      },
    }
    
    return this.request(endpoint, uploadOptions)
  }
}

// Create instance
const apiService = new ApiService()

const apiBaseUrl = config.apiBaseUrl

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
  getUsers: () => apiService.get(`${apiService.baseURL}/v1/users`),
  createUser: (userData) => apiService.post(`${apiService.baseURL}/v1/users`, userData),
  updateUser: (userId, userData) => apiService.put(`${apiService.baseURL}/v1/users/${userId}`, userData),
  deleteUser: (userId) => apiService.delete(`${apiService.baseURL}/v1/users/${userId}`),
}

// Document API methods
export const documentAPI = {
  getDocuments: () => apiService.get(apiEndpoints.documents),
  uploadDocument: (formData) => apiService.upload(apiEndpoints.uploadDocument, formData),
  summarizeDocument: (documentId) => apiService.post(apiEndpoints.summarizeDocument, { documentId }),
}

// Projects API methods
export const projectAPI = {
  createProject: (formData) => apiService.post(`${apiBaseUrl}/v1/projects`, formData),
  fetchProjects: () => apiService.get(`${apiBaseUrl}/v1/projects`),
  fetchProjectsWithConversations: () => apiService.get(`${apiBaseUrl}/v1/projects-with-conversations`),
  fetchProjectKnowledges: (id) => apiService.get(`${apiBaseUrl}/v1/projects/${id}/knowledge`),
  updateProject: (id, formData) => apiService.put(`${apiBaseUrl}/v1/projects/${id}`, formData),
  deleteProject: (id) => apiService.delete(`${apiBaseUrl}/v1/projects/${id}`),

  ingestProjectKnowledge: (id, formData) => apiService.upload(`${apiBaseUrl}/v1/projects/${id}/knowledge/ingest`, formData),
  deleteProjectKnowledge: (projectId, knowledgeId) => apiService.delete(`${apiBaseUrl}/v1/projects/${projectId}/knowledge/${knowledgeId}`),
  
  // Conversation/Chat methods
  getConversationHistory: (projectId, conversationId) => apiService.get(`${apiBaseUrl}/v1/projects/${projectId}/conversations/${conversationId}/history`),
  sendInferenceMessage: (projectId, params) => {
    return apiService.get(`${apiBaseUrl}/v1/projects/${projectId}/inference?${params}`)
  },
}

// Chat API methods
export const chatAPI = {
  sendMessage: (message) => apiService.post(apiEndpoints.chat, { message }),
  getChatHistory: () => apiService.get(apiEndpoints.chatHistory),
}

export default apiService