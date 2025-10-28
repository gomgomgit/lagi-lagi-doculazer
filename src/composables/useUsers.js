import { getUsers, getUserProfile, updateUserProfile, changeUserPassword, createUser, updateUser, deleteUser } from '@/services/usersApi'
import { ref } from 'vue'

export function useUsers() {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await getUsers()
      if (result.success) {
        users.value = result.data
        console.log('Fetched users:', result.data)
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch users'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await getUserProfile()
      if (result.success) {
        currentUser.value = result.data
        console.log('Fetched user profile:', result.data)
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch user profile'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const result = await updateUserProfile(userData)
      if (result.success) {
        console.log('User profile updated successfully:', result.data)
        currentUser.value = { ...currentUser.value, ...result.data }
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to update user profile'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    loading.value = true
    error.value = null

    try {
      const result = await changeUserPassword(passwordData)
      if (result.success) {
        console.log('Password changed successfully')
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to change password'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const addUser = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const result = await createUser(userData)
      if (result.success) {
        console.log('User created successfully:', result.data)
        
        // Add new user to the existing list
        users.value.push(result.data)
        
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to create user'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUserData = async (userId, userData) => {
    loading.value = true
    error.value = null

    try {
      const result = await updateUser(userId, userData)
      if (result.success) {
        console.log('User updated successfully:', result.data)
        
        // Update user in the existing list
        const userIndex = users.value.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex] = { ...users.value[userIndex], ...result.data }
        }
        
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to update user'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUserById = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        console.log('User deleted successfully:', userId)
        
        // Remove user from the existing list
        users.value = users.value.filter(u => u.id !== userId)
        
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = 'Failed to delete user'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    users,
    currentUser,
    loading,
    error,
    
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