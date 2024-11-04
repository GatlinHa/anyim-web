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
          component: () => import('@/views/message/MessageLayout.vue'),
          meta: {
            active_1: '/message' // 一级导航default-active
          }
        },
        {
          path: '/contacts',
          component: () => import('@/views/contacts/ContactsLayout.vue'),
          redirect: '/contacts/user',
          children: [
            {
              path: '/contacts/user',
              component: () => import('@/views/contacts/user/ContactsUser.vue'),
              redirect: '/contacts/user/all',
              children: [
                {
                  path: '/contacts/user/all',
                  component: () => import('@/views/contacts/user/SubAll.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/user' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/user/mark',
                  component: () => import('@/views/contacts/user/SubMark.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/user' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/user/partition',
                  component: () => import('@/views/contacts/user/SubPartition.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/user' // 二级导航default-active
                  }
                }
              ]
            },
            {
              path: '/contacts/group',
              component: () => import('@/views/contacts/group/ContactsGroup.vue'),
              redirect: '/contacts/group/all',
              children: [
                {
                  path: '/contacts/group/all',
                  component: () => import('@/views/contacts/group/SubAll.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/group/managed',
                  component: () => import('@/views/contacts/group/SubManaged.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/group/joined',
                  component: () => import('@/views/contacts/group/SubJoined.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/group/mark',
                  component: () => import('@/views/contacts/group/SubMark.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/group/partition',
                  component: () => import('@/views/contacts/group/SubPartition.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contacts/group/public',
                  component: () => import('@/views/contacts/group/SubPublic.vue'),
                  meta: {
                    active_1: '/contacts', // 一级导航default-active
                    active_2: '/contacts/group' // 二级导航default-active
                  }
                }
              ]
            },
            {
              path: '/contacts/organization',
              component: () => import('@/views/contacts/organization/ContactsOrganization.vue'),
              meta: {
                active_1: '/contacts' // 一级导航default-active
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
                active_1: '/setting' // 一级导航default-active
              }
            },
            {
              path: '/setting/security',
              component: () => import('@/views/setting/children/SettingSecurity.vue'),
              meta: {
                active_1: '/setting' // 一级导航default-active
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
