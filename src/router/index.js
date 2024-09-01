import { createRouter, createWebHistory } from 'vue-router'
import { userStore } from '@/stores'

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

router.beforeEach((to, from, next) => {
  // 如果没有登录，且访问的是非登录页，拦截到登录
  const userData = userStore()
  if (!userData.isLogin() && to.path !== '/login') {
    next('/login')
    return
  }

  // 如果登录，且访问的是登录页，拦截到首页
  if (userData.isLogin() && to.path === '/login') {
    next('/')
    return
  }

  // 检查是否是其他请求（除了已定义的路由之外的请求）
  if (!router.getRoutes().some((route) => route.path === to.path)) {
    next('/')
  } else {
    next()
  }
})

export default router
