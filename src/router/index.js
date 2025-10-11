import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../components/BaseLayout.vue'
import ChatView from '../views/chats/ChatView.vue'
import ChatTool from '@/views/chats/ChatTool.vue'
import ProfileView from '@/views/profiles/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      children: [
        {
          path: '',
          name: 'chat',
          components: {
            default: ChatView,
            toolbar: ChatTool
          },
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
        }
      ]
    }
  ],
})

export default router
