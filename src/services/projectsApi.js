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