import { projectAPI } from './api'

export const getKnowledges = async (params = {}) => {
  try {
    const response = await projectAPI.fetchKnowledges(params)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching knowledges:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch knowledges'
    }
  }
}