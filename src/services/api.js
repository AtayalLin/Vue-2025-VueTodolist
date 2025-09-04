import axios from 'axios'
import router from '../router'

// API 基礎設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://todolist-api.hexschool.io'

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器 - 自動添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 如果 token 過期或無效，清除本地存儲並跳轉到登入頁
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.replace('/login')
    }
    return Promise.reject(error)
  },
)

// 用戶認證相關 API
export const authAPI = {
  // 註冊
  signUp: async (userData) => {
    try {
      const response = await api.post('/users/sign_up', {
        email: userData.email,
        nickname: userData.name,
        password: userData.password,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '註冊失敗，請稍後再試',
        errors: error.response?.data?.error || [],
      }
    }
  },

  // 登入
  signIn: async (credentials) => {
    try {
      const response = await api.post('/users/sign_in', {
        email: credentials.email,
        password: credentials.password,
      })

      // 儲存 token 和用戶資訊
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem(
          'user',
          JSON.stringify({
            email: credentials.email,
            name: response.data.nickname || credentials.email.split('@')[0],
          }),
        )
      }

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登入失敗，請檢查帳號密碼',
        errors: error.response?.data?.error || [],
      }
    }
  },

  // 登出
  signOut: async () => {
    try {
      await api.post('/users/sign_out')
      // 清除本地存儲
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return {
        success: true,
      }
    } catch (error) {
      // 即使 API 調用失敗，也要清除本地存儲
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return {
        success: false,
        message: error.response?.data?.message || '登出失敗',
      }
    }
  },

  // 驗證 token
  checkout: async () => {
    try {
      const response = await api.get('/users/checkout')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token 驗證失敗',
      }
    }
  },
}

// 待辦事項相關 API
export const todoAPI = {
  // 取得所有待辦事項
  getTodos: async () => {
    try {
      const response = await api.get('/todos')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '取得待辦事項失敗',
        data: [],
      }
    }
  },

  // 新增待辦事項
  addTodo: async (content) => {
    try {
      const response = await api.post('/todos', {
        content: content,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '新增待辦事項失敗',
      }
    }
  },

  // 更新待辦事項
  updateTodo: async (id, content) => {
    try {
      const response = await api.put(`/todos/${id}`, {
        content: content,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新待辦事項失敗',
      }
    }
  },

  // 刪除待辦事項
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '刪除待辦事項失敗',
      }
    }
  },

  // 切換待辦事項狀態
  toggleTodo: async (id) => {
    try {
      const response = await api.patch(`/todos/${id}/toggle`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新待辦事項狀態失敗',
      }
    }
  },
}

export default api
