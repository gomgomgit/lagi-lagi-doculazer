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
        requiresAuth: true // Semua child routes membutuhkan authentication
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
        requiresAdmin: true
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
        }
      ]
    }
  ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('Navigation Guard:', {
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth),
    requiresGuest: to.matched.some(record => record.meta.requiresGuest),
    requiresAdmin: to.matched.some(record => record.meta.requiresAdmin),
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user
  })

  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

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
    next({ name: 'chat' }) // or wherever you want to redirect logged-in users
    return
  }

  // Check admin permissions
  if (requiresAdmin && authStore.isAuthenticated) {
    // You can add admin role check here
    // For now, we'll assume all authenticated users can access admin
    // In real app, you might check: authStore.user?.role === 'admin'
    console.log('Admin route accessed')
  }

  // Set page title if provided
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

export default router
