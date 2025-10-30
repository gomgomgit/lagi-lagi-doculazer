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

export const sendInferenceMessage = async (projectId, messageInput, conversationId, mentionedDocuments = []) => {
  try {
    // Process message to replace @ mentions with ✝ symbols
    let processedMessage = messageInput
    
    if (mentionedDocuments && mentionedDocuments.length > 0) {
      mentionedDocuments.forEach(doc => {
        console.log('Processing mentioned document for message:', doc)
        const mentionPattern = `@${doc.file_name}`
        const replacementPattern = `✝[@${doc.file_name}](KNOWLEDGE-${doc.knowledge_source_id})✝`

        // Replace all occurrences of @filename with new format for backend processing
        processedMessage = processedMessage.replace(new RegExp(mentionPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementPattern)
      })
    }
    
    // Build URL parameters
    const params = new URLSearchParams({
      human_message: processedMessage
    })
    
    // Only add conversation_id if it's not empty or undefined
    if (conversationId && conversationId.trim() !== '') {
      params.append('conversation_id', conversationId)
    }
    
    // Add mentioned documents as comma-separated string of IDs
    if (mentionedDocuments && mentionedDocuments.length > 0) {
      console.log('Sending inference message with document IDs:', mentionedDocuments)
      const uniqueIds = [...new Set(mentionedDocuments.map(doc => doc.knowledge_source_id))];
      const documentIds = uniqueIds.join(',')

      params.append('filtered_knowledge_source_ids', documentIds)
      console.log('Sending inference message params:', params)
    } else {
      console.log('Sending inference message without mentioned documents')
    }
    
    const response = await projectAPI.sendInferenceMessage(projectId, params.toString())
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

export const updateConversation = async (projectId, conversationId, data) => {
  try {
    console.log('Updating conversation:', { projectId, conversationId, data })
    const response = await projectAPI.updateConversation(projectId, conversationId, data)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error updating conversation:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update conversation'
    }
  }
}

export const downloadProjectKnowledge = async (projectId, knowledgeId) => {
  try {
    console.log('Downloading project knowledge:', { projectId, knowledgeId })
    const response = await projectAPI.downloadProjectKnowledge(projectId, knowledgeId)
    
    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `document_${knowledgeId}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }
    
    // Convert response to blob
    const blob = await response.blob()
    
    return {
      success: true,
      data: {
        blob,
        filename,
        contentType: response.headers.get('Content-Type')
      }
    }
  } catch (error) {
    console.error('Error downloading project knowledge:', error)
    return {
      success: false,
      error: error.message || 'Failed to download document'
    }
  }
}