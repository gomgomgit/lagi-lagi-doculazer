import { api } from './api.js'

/**
 * Documents API Service
 * Basic document operations
 */

// Get all documents with pagination
export const getDocuments = async (params = {}) => {
  try {
    const response = await api.get('/documents', { params })
    return {
      success: true,
      data: response.data.data,
      meta: response.data.meta
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch documents'
    }
  }
}

// Get single document by ID
export const getDocument = async (id) => {
  try {
    const response = await api.get(`/documents/${id}`)
    return {
      success: true,
      data: response.data.data
    }
  } catch (error) {
    console.error('Error fetching document:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch document'
    }
  }
}

// Upload new document
export const 
uploadDocument = async (formData, onProgress = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }

    const response = await api.post('/documents/upload', )
    return {
      success: true,
      data: response.data.data
    }
  } catch (error) {
    console.error('Error uploading document:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload document'
    }
  }
}

// Delete document
export const deleteDocument = async (id) => {
  try {
    await api.delete(`/documents/${id}`)
    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting document:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete document'
    }
  }
}