import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginPage.vue')
    },
    {
      path: '/register',
      component: () => import('@/views/RegisterPage.vue')
    },
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/message',
      children: [
        {
          path: '/message',
          component: () => import('@/views/message/MessageLayout.vue')
        },
        {
          path: '/contacts',
          component: () => import('@/views/contacts/ContactsLayout.vue')
        },
        {
          path: '/meeting',
          component: () => import('@/views/meeting/MeetingLayout.vue')
        },
        {
          path: '/user',
          component: () => import('@/views/user/UserLayout.vue')
        }
      ]
    }
  ]
})

export default router
