import { projectAPI } from './api'

export const getProjects = async (params = {}) => {
  try {
    const response = await projectAPI.fetchProjects(params)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch projects'
    }
  }
}

export const createProject = async (data) => {
  try {
    console.log('Creating project with data:', data)
    const response = await projectAPI.createProject(data)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error creating project:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create project'
    }
  }
}

export const updateProject = async (id, data) => {
  try {
    const response = await projectAPI.updateProject(id, data)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error updating project:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update project'
    }
  }
}

export const deleteProject = async (id) => {
  try {
    const response = await projectAPI.deleteProject(id)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete project'
    }
  }
}

export const getProjectsWithConversations = async () => {
  try {
    const response = await projectAPI.fetchProjectsWithConversations()
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch projects'
    }
  }
}

export const getProjectKnowledges = async (id) => {
  try {
    const response = await projectAPI.fetchProjectKnowledges(id)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch projects'
    }
  }
}

export const ingestProjectKnowledge = async (projectId, formData) => {
  try {
    const response = await projectAPI.ingestProjectKnowledge(projectId, formData)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error ingesting project knowledge:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to ingest project knowledge'
    }
  }
}

export const deleteProjectKnowledge = async (projectId, knowledgeId) => {
  try {
    const response = await projectAPI.deleteProjectKnowledge(projectId, knowledgeId)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error deleting project knowledge:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete project knowledge'
    }
  }
}

export const getConversationHistory = async (projectId, conversationId) => {
  try {
    const response = await projectAPI.getConversationHistory(projectId, conversationId)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching conversation history:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch conversation history'
    }
  }
}

export const sendInferenceMessage = async (projectId, messageInput, conversationId) => {
  try {
    const response = await projectAPI.sendInferenceMessage(projectId, messageInput, conversationId)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error sending inference message:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send message'
    }
  }
}