<template>
  <div id="signUpPage" class="bg-yellow">
    <div class="conatiner signUpPage vhContainer">
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
        <form class="formControls" @submit.prevent="handleSignUp">
          <h2 class="formControls_txt">註冊帳號</h2>
          <label class="formControls_label" for="email">Email</label>
          <input
            class="formControls_input"
            type="email"
            id="email"
            name="email"
            placeholder="請輸入 email"
            v-model="signUpForm.email"
            required
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          <label class="formControls_label" for="name">您的暱稱</label>
          <input
            class="formControls_input"
            type="text"
            name="name"
            id="name"
            placeholder="請輸入您的暱稱"
            v-model="signUpForm.name"
            required
          />
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          <label class="formControls_label" for="pwd">密碼</label>
          <input
            class="formControls_input"
            type="password"
            name="pwd"
            id="pwd"
            placeholder="請輸入密碼"
            v-model="signUpForm.password"
            required
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          <label class="formControls_label" for="confirmPwd">再次輸入密碼</label>
          <input
            class="formControls_input"
            type="password"
            name="confirmPwd"
            id="confirmPwd"
            placeholder="請再次輸入密碼"
            v-model="signUpForm.confirmPassword"
            required
          />
          <div v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </div>
          <input
            class="formControls_btnSubmit"
            type="submit"
            :value="isLoading ? '註冊中...' : '註冊帳號'"
            :disabled="isLoading"
          />
          <router-link class="formControls_btnLink" to="/login">登入</router-link>
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
  name: 'SignUpPage',
  setup() {
    const router = useRouter()

    const signUpForm = ref({
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    })

    const errors = ref({
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    })

    const isLoading = ref(false)

    const validateForm = () => {
      // 清空之前的錯誤訊息
      errors.value = { email: '', name: '', password: '', confirmPassword: '' }
      let isValid = true

      // 檢查 Email 欄位
      if (!signUpForm.value.email || signUpForm.value.email.trim() === '') {
        errors.value.email = '此欄位不可為空'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(signUpForm.value.email)) {
        errors.value.email = '請輸入有效的 email 格式'
        isValid = false
      }

      // 檢查暱稱欄位
      if (!signUpForm.value.name || signUpForm.value.name.trim() === '') {
        errors.value.name = '此欄位不可為空'
        isValid = false
      }

      // 檢查密碼欄位
      if (!signUpForm.value.password || signUpForm.value.password.trim() === '') {
        errors.value.password = '此欄位不可為空'
        isValid = false
      } else if (signUpForm.value.password.length < 6) {
        errors.value.password = '密碼至少需要 6 個字元'
        isValid = false
      }

      // 檢查確認密碼欄位
      if (!signUpForm.value.confirmPassword || signUpForm.value.confirmPassword.trim() === '') {
        errors.value.confirmPassword = '此欄位不可為空'
        isValid = false
      } else if (signUpForm.value.password !== signUpForm.value.confirmPassword) {
        errors.value.confirmPassword = '密碼不一致'
        isValid = false
      }

      return isValid
    }

    const handleSignUp = async () => {
      if (!validateForm()) {
        // 當表單驗證失敗時，顯示註冊失敗通知
        notification.error('請檢查並填寫所有必填欄位', '註冊失敗')
        return
      }

      isLoading.value = true

      try {
        const result = await authAPI.signUp({
          email: signUpForm.value.email,
          name: signUpForm.value.name,
          password: signUpForm.value.password,
        })

        if (result.success) {
          notification.success('註冊成功！請使用您的帳號登入', '註冊完成')
          // 清空表單
          signUpForm.value = {
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
          }
          // 跳轉到登入頁面
          router.push('/login')
        } else {
          // 處理 API 錯誤
          if (result.errors && result.errors.length > 0) {
            // 顯示具體的欄位錯誤
            result.errors.forEach((error) => {
              if (error.includes('email') || error.includes('Email')) {
                errors.value.email = error
              } else if (
                error.includes('nickname') ||
                error.includes('暱稱') ||
                error.includes('name')
              ) {
                errors.value.name = error
              } else if (error.includes('password') || error.includes('密碼')) {
                errors.value.password = error
              }
            })
          }

          // 處理重複註冊的特殊情況
          if (result.message && result.message.includes('已經註冊')) {
            errors.value.email = '此 Email 已經註冊過，請直接登入或使用其他 Email'
            notification.warning('此 Email 已經註冊過', '重複註冊')
          } else {
            notification.error(result.message || '註冊失敗，請稍後再試')
          }
        }
      } catch (error) {
        console.error('註冊錯誤:', error)
        notification.error('網路連線錯誤，請稍後再試')
      } finally {
        isLoading.value = false
      }
    }

    return {
      signUpForm,
      errors,
      isLoading,
      handleSignUp,
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
