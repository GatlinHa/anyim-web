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
          component: () => import('@/views/contacts/ContactsLayout.vue'),
          redirect: '/contacts/user',
          children: [
            {
              path: '/contacts/user',
              component: () => import('@/views/contacts/children/ContactsUser.vue'),
              meta: {
                active: '/contacts' //对于二级子路由的active路径还是指向父路径，方便一级导航菜单被显示为激活，同时要写:default-active="$route.meta.active || $route.path"
              }
            },
            {
              path: '/contacts/group',
              component: () => import('@/views/contacts/children/ContactsGroup.vue'),
              meta: {
                active: '/contacts' //对于二级子路由的active路径还是指向父路径，方便一级导航菜单被显示为激活，同时要写:default-active="$route.meta.active || $route.path"
              }
            },
            {
              path: '/contacts/organization',
              component: () => import('@/views/contacts/children/ContactsOrganization.vue'),
              meta: {
                active: '/contacts' //对于二级子路由的active路径还是指向父路径，方便一级导航菜单被显示为激活，同时要写:default-active="$route.meta.active || $route.path"
              }
            }
          ]
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
              component: () => import('@/views/setting/children/SettingPersonal.vue'),
              meta: {
                active: '/setting' //对于二级子路由的active路径还是指向父路径，方便一级导航菜单被显示为激活，同时要写:default-active="$route.meta.active || $route.path"
              }
            },
            {
              path: '/setting/security',
              component: () => import('@/views/setting/children/SettingSecurity.vue'),
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

router.beforeEach(async (to, from, next) => {
  const userData = userStore()
  const isLogin = await userData.isLogin()

  // 如果没有登录，且访问的是非登录页，拦截到登录
  if (!isLogin && to.path !== '/login') {
    next('/login')
    return
  }

  // 如果有登录，且访问的是登录页，拦截到首页
  if (isLogin && to.path === '/login') {
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
