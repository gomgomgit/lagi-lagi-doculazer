import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseLayout from '../components/BaseLayout.vue'
import AdminLayout from '../components/AdminLayout.vue'
import ChatView from '../views/chats/ChatView.vue'
import ProfileView from '@/views/profiles/ProfileView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import DocumentsView from '@/views/documents/DocumentsView.vue'
import FileUploadDemo from '@/views/FileUploadDemo.vue'
import UsersView from '@/views/admin/UsersView.vue'
import MultiModelView from '@/views/admin/MultiModelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresGuest: true, // Hanya bisa diakses jika belum login
        title: 'Login'
      }
    },
    {
      path: '/',
      component: BaseLayout,
      meta: {
        requiresAuth: true, // Semua child routes membutuhkan authentication
        requiresRole: 'USER', // Hanya user dengan role USER yang bisa akses BaseLayout
        allowedRoles: ['USER'] // Explicitly define allowed roles
      },
      children: [
        {
          path: '',
          name: 'chat',
          component: ChatView,
          meta: {
            header: 'Chat With AI',
            subtitle: 'Break down lengthy texts into concise summaries to grasp.'
          }
        },
        {
          path: '/chat/:projectId/:conversationId',
          name: 'chat-conversation',
          component: ChatView,
          meta: {
            header: 'Chat With AI',
            subtitle: 'Break down lengthy texts into concise summaries to grasp.'
          }
        },
        {
          path: '/project/:projectId/overview',
          name: 'chat-project-overview',
          component: ChatView,
          meta: {
            header: 'Project Overview',
            subtitle: 'View all conversations in this project.'
          }
        },
        {
          path: '/profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            header: 'Profile',
            subtitle: 'Manage your account settings and preferences.'
          }
        },
        {
          path: '/documents',
          name: 'documents',
          component: DocumentsView,
          meta: {
            header: 'Documents',
            subtitle: 'Manage your documents and files.'
          }
        },
        {
          path: '/upload-demo',
          name: 'upload-demo',
          component: FileUploadDemo,
          meta: {
            header: 'File Upload Demo',
            subtitle: 'Demonstration of drag and drop file upload component.'
          }
        }
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        requiresRole: 'ADMIN', // Hanya user dengan role ADMIN yang bisa akses AdminLayout
        allowedRoles: ['ADMIN'] // Explicitly define allowed roles
      },
      children: [
        {
          path: '',
          redirect: '/admin/users'
        },
        {
          path: 'users',
          name: 'admin-users',
          component: UsersView,
          meta: {
            header: 'User Management',
            subtitle: 'Manage system users and their permissions'
          }
        },
        {
          path: 'llm',
          name: 'admin-llm',
          component: MultiModelView,
          meta: {
            header: 'Multi Model Management',
            subtitle: 'Configure and manage Large Language Models and Embeddings'
          }
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: ProfileView,
          meta: {
            header: 'Admin Profile',
            subtitle: 'Manage your admin account settings and preferences.'
          }
        }
      ]
    },
    // Catch-all route for handling unknown paths
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: (to) => {
        // This will be handled by the navigation guard
        return { name: 'login' }
      }
    }
  ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Ensure user data is loaded if authenticated
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUser()
  }
  
  const userRole = authStore.user?.role || null
  
  console.log('Navigation Guard:', {
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth),
    requiresGuest: to.matched.some(record => record.meta.requiresGuest),
    requiresAdmin: to.matched.some(record => record.meta.requiresAdmin),
    requiresRole: to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole,
    allowedRoles: to.matched.find(record => record.meta.allowedRoles)?.meta.allowedRoles,
    isAuthenticated: authStore.isAuthenticated,
    userRole: userRole,
    user: authStore.user
  })

  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiredRole = to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole
  const allowedRoles = to.matched.find(record => record.meta.allowedRoles)?.meta.allowedRoles

  // Redirect to login if not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - not authenticated')
    next({
      name: 'login',
      query: { redirect: to.fullPath } // Save intended destination
    })
    return
  }

  // Redirect authenticated users away from guest-only pages (like login)
  if (requiresGuest && authStore.isAuthenticated) {
    console.log('Redirecting authenticated user away from guest page')
    // Redirect based on user role
    if (userRole === 'ADMIN') {
      next({ name: 'admin-users' }) // Redirect admin to admin panel
    } else {
      next({ name: 'chat' }) // Redirect user to chat
    }
    return
  }

  // Role-based access control
  if (authStore.isAuthenticated && (requiredRole || allowedRoles)) {
    if (!userRole) {
      console.log('User role not found, redirecting to login')
      await authStore.logout()
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Check if user has required role
    const hasRequiredRole = requiredRole ? userRole === requiredRole : true
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(userRole) : true

    if (!hasRequiredRole || !hasAllowedRole) {
      console.log(`Access denied - User role: ${userRole}, Required: ${requiredRole}, Allowed: ${allowedRoles}`)
      
      // Redirect to appropriate page based on user role
      if (userRole === 'ADMIN') {
        console.log('Redirecting ADMIN to admin panel')
        next({ name: 'admin-users' })
      } else if (userRole === 'USER') {
        console.log('Redirecting USER to chat')
        next({ name: 'chat' })
      } else {
        console.log('Unknown role, logging out')
        await authStore.logout()
        next({ name: 'login' })
      }
      return
    }
  }

  // Legacy admin check (keeping for backward compatibility)
  if (requiresAdmin && authStore.isAuthenticated) {
    if (userRole !== 'ADMIN') {
      console.log('Access denied - Admin route requires ADMIN role')
      next({ name: 'chat' })
      return
    }
    console.log('Admin route accessed by ADMIN user')
  }

  // Set page title if provided
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

export default router
