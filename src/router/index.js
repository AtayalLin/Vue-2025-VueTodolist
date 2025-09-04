import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import SignUpPage from '../views/SignUpPage.vue'
import TodoListPage from '../views/TodoListPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpPage,
    },
    {
      path: '/todolist',
      name: 'todolist',
      component: TodoListPage,
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守衛
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'signup') && token) {
    next('/todolist')
  } else {
    next()
  }
})

export default router
