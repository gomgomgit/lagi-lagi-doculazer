import { ref } from 'vue'

// Shared state (singleton pattern)
const loading = ref(false)
const error = ref(null)

export function useProfiles() {
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

  const updateProfile = async (profileData) => {
    return apiCall(async () => {
      const { userAPI } = await import('@/services/api')
      const response = await userAPI.updateProfile(profileData)
      
      // Update user data in auth store
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      
      if (response.user) {
        authStore.setUser(response.user)
      }
      
      return response
    })
  }

  const changePassword = (passwordData) => 
    apiCall(async () => {
      const { userAPI } = await import('@/services/api')
      const result = await userAPI.changePassword(passwordData)
      console.log('Change password result:', result)
      return result
    })

  const clearError = () => error.value = null

  return {
    // State
    loading,
    error,
    
    // Methods
    updateProfile,
    changePassword,
    clearError
  }
}