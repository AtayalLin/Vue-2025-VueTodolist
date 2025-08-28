<template>
  <div id="loginPage" class="bg-yellow">
    <div class="conatiner loginPage vhContainer">
      <div class="side">
        <a href="#"
          ><img
            class="logoImg"
            src="https://raw.githubusercontent.com/hexschool/2022-web-layout-training/main/todolist/logo.png"
            alt=""
        /></a>
        <img
          class="d-m-n"
          src="https://raw.githubusercontent.com/hexschool/2022-web-layout-training/main/todolist/img.png"
          alt="workImg"
        />
      </div>
      <div>
        <form class="formControls" @submit.prevent="handleLogin" novalidate>
          <h2 class="formControls_txt">最實用的線上代辦事項服務</h2>
          <label class="formControls_label" for="email">Email</label>
          <input
            class="formControls_input"
            type="email"
            id="email"
            name="email"
            placeholder="請輸入 email"
            v-model="loginForm.email"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          <label class="formControls_label" for="pwd">密碼</label>
          <input
            class="formControls_input"
            type="password"
            name="pwd"
            id="pwd"
            placeholder="請輸入密碼"
            v-model="loginForm.password"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          <input
            class="formControls_btnSubmit"
            type="submit"
            :value="isLoading ? '登入中...' : '登入'"
            :disabled="isLoading"
          />
          <router-link class="formControls_btnLink" to="/signup">註冊帳號</router-link>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'
import { notification } from '@/services/notification'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()

    const loginForm = ref({
      email: '',
      password: '',
    })

    const errors = ref({
      email: '',
      password: '',
    })

    const isLoading = ref(false)

    const validateForm = () => {
      // 清空之前的錯誤訊息
      errors.value = { email: '', password: '' }
      let isValid = true

      // 檢查 Email 欄位
      if (!loginForm.value.email || loginForm.value.email.trim() === '') {
        errors.value.email = '此欄位不可為空'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(loginForm.value.email)) {
        errors.value.email = '請輸入有效的 email 格式'
        isValid = false
      }

      // 檢查密碼欄位
      if (!loginForm.value.password || loginForm.value.password.trim() === '') {
        errors.value.password = '此欄位不可為空'
        isValid = false
      }

      return isValid
    }

    const handleLogin = async () => {
      // 執行表單驗證
      const isFormValid = validateForm()

      if (!isFormValid) {
        // 當表單驗證失敗時，顯示登入失敗通知
        notification.error('請檢查並填寫所有必填欄位', '登入失敗')
        return
      }

      isLoading.value = true

      try {
        const result = await authAPI.signIn({
          email: loginForm.value.email,
          password: loginForm.value.password,
        })

        if (result.success) {
          notification.success('登入成功！', '歡迎回來')
          router.push('/todolist')
        } else {
          // 處理 API 錯誤
          if (result.errors && result.errors.length > 0) {
            // 顯示具體的欄位錯誤
            result.errors.forEach((error) => {
              if (error.includes('email') || error.includes('Email')) {
                errors.value.email = error
              } else if (error.includes('password') || error.includes('密碼')) {
                errors.value.password = error
              }
            })
          } else {
            notification.error(result.message || '登入失敗，請檢查帳號密碼')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        notification.error('網路連線錯誤，請稍後再試')
      } finally {
        isLoading.value = false
      }
    }

    return {
      loginForm,
      errors,
      isLoading,
      handleLogin,
    }
  },
}
</script>

<style scoped>
.error-message {
  color: #d87355 !important;
  font-size: 0.875rem !important;
  font-weight: bold !important;
  margin: 4px 0 16px 0 !important;
  display: block !important;
  line-height: 1.2 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  text-align: left !important;
}

.formControls_btnSubmit:disabled {
  background-color: #999 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}
</style>
