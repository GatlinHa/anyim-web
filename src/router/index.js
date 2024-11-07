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
          path: '/contactList',
          component: () => import('@/views/contactList/ContactListLayout.vue'),
          redirect: '/contactList/user',
          children: [
            {
              path: '/contactList/user',
              component: () => import('@/views/contactList/user/ContactListUser.vue'),
              redirect: '/contactList/user/all',
              children: [
                {
                  path: '/contactList/user/all',
                  component: () => import('@/views/contactList/user/SubAll.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/user' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/user/mark',
                  component: () => import('@/views/contactList/user/SubMark.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/user' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/user/partition',
                  component: () => import('@/views/contactList/user/SubPartition.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/user' // 二级导航default-active
                  }
                }
              ]
            },
            {
              path: '/contactList/group',
              component: () => import('@/views/contactList/group/ContactListGroup.vue'),
              redirect: '/contactList/group/all',
              children: [
                {
                  path: '/contactList/group/all',
                  component: () => import('@/views/contactList/group/SubAll.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/group/managed',
                  component: () => import('@/views/contactList/group/SubManaged.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/group/joined',
                  component: () => import('@/views/contactList/group/SubJoined.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/group/mark',
                  component: () => import('@/views/contactList/group/SubMark.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/group/partition',
                  component: () => import('@/views/contactList/group/SubPartition.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                },
                {
                  path: '/contactList/group/public',
                  component: () => import('@/views/contactList/group/SubPublic.vue'),
                  meta: {
                    active_1: '/contactList', // 一级导航default-active
                    active_2: '/contactList/group' // 二级导航default-active
                  }
                }
              ]
            },
            {
              path: '/contactList/organization',
              component: () =>
                import('@/views/contactList/organization/ContactListOrganization.vue'),
              meta: {
                active_1: '/contactList' // 一级导航default-active
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
