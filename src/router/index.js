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
              component: () => import('@/views/setting/SettingPersonal.vue'),
              meta: {
                active: '/setting' //对于二级子路由的active路径还是指向父路径，方便一级导航菜单被显示为激活，同时要写:default-active="$route.meta.active || $route.path"
              }
            },
            {
              path: '/setting/security',
              component: () => import('@/views/setting/SettingSecurity.vue'),
              meta: {
                active: '/setting' //同上
              }
            }
          ]
        }
      ]
    }
  ]
})

export default router
