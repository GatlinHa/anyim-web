import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginPage.vue')
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
          path: '/setting',
          component: () => import('@/views/setting/SettingLayout.vue'),
          redirect: '/setting/personal',
          children: [
            {
              path: '/setting/personal',
              component: () => import('@/views/setting/SettingPersonal.vue')
            },
            {
              path: '/setting/security',
              component: () => import('@/views/setting/SettingSecurity.vue')
            }
          ]
        }
      ]
    }
  ]
})

export default router
