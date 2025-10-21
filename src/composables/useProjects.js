import { getProjectKnowledges, getProjects, getProjectsWithConversations, createProject, updateProject, deleteProject } from "@/services/projectsApi"
import { ref } from "vue"

export function useProjects() {
  // State
  const projects = ref([])
  const projectsWithConversations = ref([])
  const projectKnowledges = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const fetchProjects = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await getProjects()
      if (result.success) {
        projects.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchProjectsWithConversations = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await getProjectsWithConversations()
      if (result.success) {
        console.log('Fetched projects with conversations:', result.data)
        projectsWithConversations.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch projects with conversations'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchProjectKnowledges = async (id) => {
    loading.value = true
    error.value = null

    try {
      const result = await getProjectKnowledges(id)
      if (result.success) {
        console.log('Fetched project knowledges:', result.data)
        projectKnowledges.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch project knowledges'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const addProject = async (projectData) => {
    loading.value = true
    error.value = null

    try {
      const result = await createProject(projectData)
      if (result.success) {
        console.log('Project created successfully:', result.data)
        
        // Add new project to the existing lists
        projects.value.push(result.data)
        
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to create project'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const updateProjectData = async (id, projectData) => {
    loading.value = true
    error.value = null

    try {

      console.log('Updating project with ID:', id, 'and data:', projectData)
      const result = await updateProject(id, projectData)
      if (result.success) {
        console.log('Project updated successfully:', result.data)
        
        // Update project in both lists
        const projectIndex = projects.value.findIndex(p => p.id === id)
        if (projectIndex !== -1) {
          projects.value[projectIndex] = { ...projects.value[projectIndex], ...result.data }
        }
        
        const projectWithConvIndex = projectsWithConversations.value.findIndex(p => p.id === id)
        if (projectWithConvIndex !== -1) {
          projectsWithConversations.value[projectWithConvIndex] = { 
            ...projectsWithConversations.value[projectWithConvIndex], 
            ...result.data 
          }
        }
        
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to update project'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProjectById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const result = await deleteProject(id)
      if (result.success) {
        console.log('Project deleted successfully:', id)
        
        // Remove project from both lists
        projects.value = projects.value.filter(p => p.id !== id)
        projectsWithConversations.value = projectsWithConversations.value.filter(p => p.id !== id)
        
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = 'Failed to delete project'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    projectsWithConversations,
    projectKnowledges,
    currentProject,
    loading,
    error,
    
    fetchProjects,
    fetchProjectsWithConversations,
    fetchProjectKnowledges,
    addProject,
    updateProjectData,
    deleteProjectById,
    clearError
  }
}