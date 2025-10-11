import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../components/BaseLayout.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        }
      ]
    }
  ],
})

export default router
