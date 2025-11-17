import { getUsers, getUserProfile, updateUserProfile, changeUserPassword, createUser, updateUser, deleteUser } from '@/services/usersApi'
import { ref } from 'vue'

export function useUsers() {
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
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

  const fetchUsers = () => 
    apiCall(() => getUsers(), (data) => users.value = data)

  const fetchUserProfile = () => 
    apiCall(() => getUserProfile(), (data) => currentUser.value = data)

  const updateProfile = (userData) => 
    apiCall(() => updateUserProfile(userData), (data) => {
      currentUser.value = { ...currentUser.value, ...data }
    })

  const changePassword = (passwordData) => 
    apiCall(() => changeUserPassword(passwordData))

  const addUser = (userData) => 
    apiCall(() => createUser(userData), (data) => users.value.push(data))

  const updateUserData = (userId, userData) => 
    apiCall(() => updateUser(userId, userData), (data) => {
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = { ...users.value[userIndex], ...data }
      }
    })

  const deleteUserById = (userId) => 
    apiCall(() => deleteUser(userId), () => {
      users.value = users.value.filter(u => u.id !== userId)
    })

  const clearError = () => error.value = null

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    
    // Methods
    fetchUsers,
    fetchUserProfile,
    updateProfile,
    changePassword,
    addUser,
    updateUserData,
    deleteUserById,
    clearError
  }
}