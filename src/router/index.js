import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../components/BaseLayout.vue'
import AdminLayout from '../components/AdminLayout.vue'
import ChatView from '../views/chats/ChatView.vue'
import ProfileView from '@/views/profiles/ProfileView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import DocumentsView from '@/views/documents/DocumentsView.vue'
import FileUploadDemo from '@/views/FileUploadDemo.vue'
import UsersView from '@/views/admin/UsersView.vue'
import LLMView from '@/views/admin/LLMView.vue'

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
          component: LLMView,
          meta: {
            header: 'LLM Management',
            subtitle: 'Configure and manage Large Language Models'
          }
        }
      ]
    }
  ],
})

export default router
