// Authentication Middleware
// This file contains helper functions for route authentication

import { useAuthStore } from '@/stores/auth'

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const authStore = useAuthStore()
  return authStore.isAuthenticated
}

/**
 * Check if user has admin role
 * @returns {boolean}
 */
export const isAdmin = () => {
  const authStore = useAuthStore()
  // You can modify this based on your user role structure
  return authStore.user?.role === 'ADMIN'
}

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const authStore = useAuthStore()
  const userPermissions = authStore.user?.permissions || []
  return userPermissions.includes(permission)
}

/**
 * Route guard for authentication
 * @param {Object} to - Route object
 * @param {Object} from - Route object  
 * @param {Function} next - Next function
 */
export const requireAuth = (to, from, next) => {
  if (!isAuthenticated()) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

/**
 * Route guard for guest only (not authenticated)
 * @param {Object} to - Route object
 * @param {Object} from - Route object
 * @param {Function} next - Next function
 */
export const requireGuest = (to, from, next) => {
  if (isAuthenticated()) {
    next({ name: 'chat' })
  } else {
    next()
  }
}

/**
 * Route guard for admin only
 * @param {Object} to - Route object
 * @param {Object} from - Route object
 * @param {Function} next - Next function
 */
export const requireAdmin = (to, from, next) => {
  if (!isAuthenticated()) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else if (!isAdmin()) {
    // Redirect to unauthorized page or home
    next({ name: 'chat' })
  } else {
    next()
  }
}