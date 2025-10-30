import { config, apiEndpoints } from '@/config'

// Helper untuk mendapatkan auth token
const getAuthToken = async () => {
  try {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    return authStore.token
  } catch {
    return localStorage.getItem('auth_token')
  }
}

// Helper untuk handle auth error
const handleAuthError = async () => {
  try {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.logout()
  } catch (error) {
    console.warn('Could not logout user:', error)
  }
}

// Base API class - lebih simple
class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl
  }

  // Generic request method - disederhanakan
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    
    // Setup headers
    const headers = { ...options.headers }
    if (!options.isUpload && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Add auth token
    const token = await getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, { ...options, headers })
      
      if (!response.ok) {
        if (response.status === 401) {
          await handleAuthError()
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, { method: 'GET', ...options })
    return response.json()
  }

  async post(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
    return response.json()
  }

  async put(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
    return response.json()
  }

  async patch(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
    return response.json()
  }

  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, { method: 'DELETE', ...options })
    return response.json()
  }

  async upload(endpoint, formData, options = {}) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: formData,
      isUpload: true,
      ...options,
    })
    return response.json()
  }

  async download(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options })
  }
}

// Create instance
const api = new ApiService()
const baseUrl = config.apiBaseUrl

// Helper untuk membuat URL endpoint
const url = (path) => `${baseUrl}${path}`

// Auth API - simple
export const authAPI = {
  login: (credentials) => api.post(apiEndpoints.login, credentials),
  register: (userData) => api.post(apiEndpoints.register, userData),
  logout: () => api.post(apiEndpoints.logout),
}

// User API - simple
export const userAPI = {
  getProfile: () => api.get(apiEndpoints.profile),
  updateProfile: (data) => api.put(apiEndpoints.updateProfile, data),
  changePassword: (data) => api.put(url('/v1/users/me/password'), data),
  getUsers: () => api.get(url('/v1/users')),
  createUser: (userData) => api.post(url('/v1/users'), userData),
  updateUser: (userId, userData) => api.put(url(`/v1/users/${userId}`), userData),
  deleteUser: (userId) => api.delete(url(`/v1/users/${userId}`)),
}

// Document API - simple
export const documentAPI = {
  getDocuments: () => api.get(apiEndpoints.documents),
  uploadDocument: (formData) => api.upload(apiEndpoints.uploadDocument, formData),
  summarizeDocument: (documentId) => api.post(apiEndpoints.summarizeDocument, { documentId }),
}

// Project API - simple dan terorganisir
export const projectAPI = {
  // Project CRUD
  createProject: (formData) => api.post(url('/v1/projects'), formData),
  fetchProjects: () => api.get(url('/v1/projects')),
  fetchProjectsWithConversations: () => api.get(url('/v1/projects-with-conversations')),
  updateProject: (id, formData) => api.put(url(`/v1/projects/${id}`), formData),
  deleteProject: (id) => api.delete(url(`/v1/projects/${id}`)),

  // Knowledge management
  fetchProjectKnowledges: (id) => api.get(url(`/v1/projects/${id}/knowledge`)),
  ingestProjectKnowledge: (id, formData) => api.upload(url(`/v1/projects/${id}/knowledge/ingest`), formData),
  deleteProjectKnowledge: (projectId, knowledgeId) => api.delete(url(`/v1/projects/${projectId}/knowledge/${knowledgeId}`)),
  downloadProjectKnowledge: (projectId, knowledgeId) => api.download(url(`/v1/projects/${projectId}/knowledge/${knowledgeId}/download`)),
  
  // Conversations
  getConversationHistory: (projectId, conversationId) => api.get(url(`/v1/projects/${projectId}/conversations/${conversationId}/history`)),
  updateConversation: (projectId, conversationId, data) => api.patch(url(`/v1/projects/${projectId}/conversations/${conversationId}`), data),
  sendInferenceMessage: (projectId, params) => api.get(url(`/v1/projects/${projectId}/inference?${params}`)),
}

// Chat API - simple
export const chatAPI = {
  sendMessage: (message) => api.post(apiEndpoints.chat, { message }),
  getChatHistory: () => api.get(apiEndpoints.chatHistory),
}

export default api