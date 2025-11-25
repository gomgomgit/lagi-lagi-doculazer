import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('auth_user')) || null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isGuest = computed(() => !token.value)
  const userId = computed(() => user.value?.user_id || null)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isUser = computed(() => user.value?.role === 'USER')

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('auth_user')
    }
  }

  const login = async (credentials) => {
    isLoading.value = true
    try {
      // Import authAPI di dalam function untuk menghindari circular dependency
      const { authAPI } = await import('@/services/api')
      const response = await authAPI.login(credentials)
      
      console.log('Login response:', response) // Debug log
      
      // Handle different possible response structures
      const tokenValue = response?.result?.access_token
      
      if (tokenValue) {
        setToken(tokenValue)
        // Set user data from response structure
        const userData = {
          user_id: response?.result?.user?.user_id,
          ...response?.result?.user
        }
        
        console.log('User data extracted:', userData) // Debug log
        console.log('User ID:', userData.user_id) // Debug log
        console.log('User Role:', userData.role) // Debug log
        
        setUser(userData)
        
        // If no user data in login response, fetch it separately
        if (!userData) {
          setTimeout(() => fetchUser(), 100) // Fetch user data after login
        }
        
        return { success: true, data: response }
      } else {
        throw new Error('No token received from server')
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      // Handle specific error messages
      if (error.message.includes('401')) {
        errorMessage = 'Invalid email or password.'
      } else if (error.message.includes('400')) {
        errorMessage = 'Please check your email and password.'
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      // Call logout API if needed
      const { authAPI } = await import('@/services/api')
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API call fails
    } finally {
      // Clear local data
      setToken(null)
      setUser(null)
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      const { authAPI } = await import('@/services/api')
      const response = await authAPI.register(userData)
      
      if (response.token) {
        setToken(response.token)
        setUser(response.user || null)
        return { success: true, data: response }
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const { userAPI } = await import('@/services/api')
      const userData = await userAPI.getProfile()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Fetch user error:', error)
      // If token is invalid, logout
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        logout()
      }
    }
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true
    try {
      const { userAPI } = await import('@/services/api')
      const response = await userAPI.updateProfile(profileData)
      
      // Update user data in store
      if (response.user) {
        setUser(response.user)
      }
      
      return { success: true, data: response }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    isLoading.value = true
    try {
      const { userAPI } = await import('@/services/api')
      const response = await userAPI.changePassword(passwordData)
      console.log('Change password response:', response)
      return { success: true, data: response }
    } catch (error) {
      console.error('Change password error:', response)
      return { success: false, error: error }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize user data if token exists
  const initialize = async () => {
    if (token.value && !user.value) {
      await fetchUser()
    }
  }

  // Test login function dengan credentials yang diberikan
  const testLogin = async () => {
    return await login({
      email: 'desdrianton@gmail.com',
      password: '123123'
    })
  }

  return {
    // State
    token,
    user,
    isLoading,
    
    // Getters
    isAuthenticated,
    isGuest,
    userId,
    userRole,
    isAdmin,
    isUser,
    
    // Actions
    setToken,
    setUser,
    login,
    logout,
    register,
    fetchUser,
    updateProfile,
    changePassword,
    initialize,
    testLogin
  }
})