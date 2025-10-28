import { userAPI } from './api'

export const getUsers = async (params = {}) => {
  try {
    const response = await userAPI.getUsers(params)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch users'
    }
  }
}

export const getUserProfile = async () => {
  try {
    const response = await userAPI.getProfile()
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user profile'
    }
  }
}

export const updateUserProfile = async (data) => {
  try {
    const response = await userAPI.updateProfile(data)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user profile'
    }
  }
}

export const changeUserPassword = async (data) => {
  try {
    const response = await userAPI.changePassword(data)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error changing password:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to change password'
    }
  }
}

export const createUser = async (userData) => {
  try {
    console.log('Creating user with data:', userData)
    const response = await userAPI.createUser(userData)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create user'
    }
  }
}

export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user with ID:', userId, 'and data:', userData)
    const response = await userAPI.updateUser(userId, userData)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user'
    }
  }
}

export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user with ID:', userId)
    const response = await userAPI.deleteUser(userId)
    return {
      success: true,
      data: response.result,
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete user'
    }
  }
}