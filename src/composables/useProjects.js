import { getProjectKnowledges, getProjects, getProjectsWithConversations, createProject, updateProject, deleteProject, ingestProjectKnowledge, deleteProjectKnowledge, downloadProjectKnowledge, getConversationHistory, sendInferenceMessage, updateConversation, getChunkByMessage } from '@/services/projectsApi'
import { ref } from 'vue'

// Shared state (singleton pattern)
const projects = ref([])
const projectsWithConversations = ref([])
const projectKnowledges = ref([])
const conversationHistory = ref([])
const loading = ref(false)
const documentsLoading = ref(false)
const error = ref(null)

export function useProjects() {
  const apiCall = async (apiFunction, successCallback = null) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunction()
      if (result.success) {
        if (successCallback) successCallback(result.data)
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = err.message || 'API call failed'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const documentsApiCall = async (apiFunction, successCallback = null) => {
    documentsLoading.value = true
    error.value = null
    
    try {
      const result = await apiFunction()
      if (result.success) {
        if (successCallback) successCallback(result.data)
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = err.message || 'API call failed'
      console.error(err)
      return null
    } finally {
      documentsLoading.value = false
    }
  }

  const fetchProjects = () => 
    apiCall(() => getProjects(), (data) => projects.value = data)

  const fetchProjectsWithConversations = () => 
    apiCall(() => getProjectsWithConversations(), (data) => projectsWithConversations.value = data)

  const fetchProjectKnowledges = (id) => 
    documentsApiCall(() => getProjectKnowledges(id), (data) => {
      projectKnowledges.value = data
    })

  const fetchConversationHistory = (projectId, conversationId) => 
    apiCall(() => getConversationHistory(projectId, conversationId), (data) => conversationHistory.value = data)

  const addProject = (projectData) => 
    apiCall(() => createProject(projectData), (data) => projects.value.push(data))

  const updateProjectData = (id, projectData) => 
    apiCall(() => updateProject(id, projectData), (data) => {
      const updateInArray = (arr) => {
        const index = arr.findIndex(p => p.id === id)
        if (index !== -1) arr[index] = { ...arr[index], ...data }
      }
      updateInArray(projects.value)
      updateInArray(projectsWithConversations.value)
    })

  const deleteProjectById = (id) => 
    apiCall(() => deleteProject(id), () => {
      projects.value = projects.value.filter(p => p.id !== id)
      projectsWithConversations.value = projectsWithConversations.value.filter(p => p.id !== id)
    })

  const sendMessage = (projectId, messageInput, conversationId, mentionedDocuments = [], mechanism = 'simple') =>
    apiCall(() => sendInferenceMessage(projectId, messageInput, conversationId, mentionedDocuments, mechanism))

  const fetchChunkByMessage = (projectId, chunkId, messageId) =>
    apiCall(() => getChunkByMessage(projectId, chunkId, messageId))

  const updateConversationData = (projectId, conversationId, updatedData) =>
    apiCall(() => updateConversation(projectId, conversationId, updatedData))

  const downloadProjectKnowledgeById = (projectId, knowledgeId) =>
    apiCall(() => downloadProjectKnowledge(projectId, knowledgeId))

  const uploadProjectKnowledge = (projectId, formData) =>
    apiCall(() => ingestProjectKnowledge(projectId, formData))

  const deleteProjectKnowledgeById = (projectId, knowledgeId) =>
    apiCall(() => deleteProjectKnowledge(projectId, knowledgeId))

  const clearError = () => error.value = null

  return {
    // State
    projects,
    projectsWithConversations,
    projectKnowledges,
    conversationHistory,
    loading,
    documentsLoading,
    error,
    
    // Methods
    fetchProjects,
    fetchProjectsWithConversations,
    fetchProjectKnowledges,
    fetchConversationHistory,
    fetchChunkByMessage,
    sendMessage,
    uploadProjectKnowledge,
    deleteProjectKnowledgeById,
    addProject,
    updateProjectData,
    updateConversationData,
    deleteProjectById,
    downloadProjectKnowledgeById,
    clearError
  }
}