import { getProjectKnowledges, getProjects } from "@/services/projectsApi"
import { ref } from "vue"

export function useProjects() {
  // State
  const projects = ref([])
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

  return {
    projects,
    projectKnowledges,
    currentProject,
    loading,
    error,
    
    fetchProjects,
    fetchProjectKnowledges
  }
}