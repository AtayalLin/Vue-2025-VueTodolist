<template>
  <div id="todoListPage" class="bg-half">
    <nav>
      <h1><a href="#">ONLINE TODO LIST</a></h1>
      <ul>
        <li class="todo_sm">
          <router-link to="/todolist"
            ><span>{{ userName }}的代辦</span></router-link
          >
        </li>
        <li><a href="#" @click.prevent="handleLogout">登出</a></li>
      </ul>
    </nav>
    <div class="conatiner todoListPage vhContainer">
      <div class="todoList_Content">
        <div class="inputBox">
          <input
            type="text"
            placeholder="請輸入待辦事項"
            v-model.trim="newTodo"
            @keyup.enter="addTodo"
          />
          <a href="#" @click.prevent="addTodo">
            <i class="fa fa-plus"></i>
          </a>
        </div>
        <div class="todoList_list" v-if="todos.length > 0">
          <ul class="todoList_tab">
            <li>
              <a
                href="#"
                :class="{ active: currentFilter === 'all' }"
                @click.prevent="setFilter('all')"
                >全部</a
              >
            </li>
            <li>
              <a
                href="#"
                :class="{ active: currentFilter === 'pending' }"
                @click.prevent="setFilter('pending')"
                >待完成</a
              >
            </li>
            <li>
              <a
                href="#"
                :class="{ active: currentFilter === 'completed' }"
                @click.prevent="setFilter('completed')"
                >已完成</a
              >
            </li>
          </ul>
          <div class="todoList_items">
            <ul class="todoList_item">
              <li v-for="todo in filteredTodos" :key="todo.id">
                <label class="todoList_label">
                  <input
                    class="todoList_input"
                    type="checkbox"
                    :checked="todo.completed"
                    @change="toggleTodo(todo.id)"
                  />
                  <span>{{ todo.text }}</span>
                </label>
                <a href="#" @click.prevent="deleteTodo(todo.id)">
                  <i class="fa fa-times"></i>
                </a>
              </li>
            </ul>
            <div class="todoList_statistics">
              <p>{{ pendingCount }} 個待完成項目</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態顯示 - 移到容器外層 -->
      <div v-if="todos.length === 0" class="empty-state">
        <p class="empty-title">目前尚無待辦事項</p>
        <img
          src="https://raw.githubusercontent.com/hexschool/2022-web-layout-training/main/todolist/empty%201.png"
          alt="目前尚無待辦事項"
          class="empty-image"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, todoAPI } from '@/services/api'
import { notification } from '@/services/notification'

export default {
  name: 'TodoListPage',
  setup() {
    const router = useRouter()
    const newTodo = ref('')
    const currentFilter = ref('all')
    const todos = ref([])
    const userName = ref('')

    // 預設待辦事項 - 使用負數 ID 避免與 API ID 衝突
    const defaultTodos = [
      { id: -1, text: '把冰箱裡昨天的廚餘拿去丟', completed: false },
      { id: -2, text: '打電話給通知爸媽下禮拜一起吃飯', completed: false },
      { id: -3, text: '幫同學組高階電腦', completed: false },
      { id: -4, text: '繳網路費、電費、水費、電信費、瓦斯費', completed: true },
      { id: -5, text: '約協志禮拜五晚上去看2266演唱會', completed: false },
      { id: -6, text: '約Ikura禮拜六晚上去看Yowasabi演唱會', completed: false },
    ]

    // 載入待辦事項資料
    const loadTodos = async () => {
      try {
        const result = await todoAPI.getTodos()
        if (result.success && result.data.length > 0) {
          // 轉換 API 資料格式以符合本地格式
          todos.value = result.data.map((todo) => ({
            id: todo.id,
            text: todo.content,
            completed: todo.status,
          }))
        } else {
          // API 沒有資料或載入失敗，使用預設資料
          todos.value = [...defaultTodos]
          console.log('使用預設待辦事項資料')
        }
      } catch (error) {
        console.error('Load todos error:', error)
        // 載入失敗，使用預設資料
        todos.value = [...defaultTodos]
        console.log('API 載入失敗，使用預設待辦事項資料')
      }
    }

    // 從 localStorage 載入用戶資料並載入待辦事項
    onMounted(async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.email) {
        router.push('/login')
        return
      }
      userName.value = user.name || user.email.split('@')[0]

      // 載入待辦事項
      await loadTodos()
    })

    // 新增待辦事項
    const addTodo = async () => {
      if (newTodo.value.trim()) {
        const todoText = newTodo.value.trim()
        try {
          const result = await todoAPI.addTodo(todoText)
          if (result.success) {
            // 轉換 API 資料格式以符合本地格式
            const newTodoItem = {
              id: result.data.newTodo.id,
              text: result.data.newTodo.content,
              completed: result.data.newTodo.status,
            }
            todos.value.push(newTodoItem)
            newTodo.value = ''
            notification.success(`成功將「${todoText}」加入待辦事項區域`)
          }
        } catch (error) {
          console.error('Add todo error:', error)
          notification.error('新增失敗，請稍後再試', '錯誤')
        }
      }
    }

    // 切換待辦事項狀態
    const toggleTodo = async (id) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        const originalState = todo.completed

        // 如果是本地預設資料（負數 ID），直接更新本地狀態
        if (id < 0) {
          todo.completed = !todo.completed
          // 顯示狀態切換通知
          if (todo.completed) {
            notification.success(`「${todo.text}」已完成！`, '任務完成')
          } else {
            notification.info(`「${todo.text}」已移回待完成`, '狀態更新')
          }
          return
        }

        // API 資料，先樂觀更新，如果失敗再回復
        todo.completed = !todo.completed

        try {
          const result = await todoAPI.toggleTodo(id)
          if (result.success) {
            // API 成功，顯示狀態切換通知
            if (todo.completed) {
              notification.success(`「${todo.text}」已完成！`, '任務完成')
            } else {
              notification.info(`「${todo.text}」已移回待完成`, '狀態更新')
            }
          } else {
            // API 失敗，回復原狀態
            todo.completed = originalState
            notification.error('更新狀態失敗，請稍後再試', '錯誤')
          }
        } catch (error) {
          // API 失敗，回復原狀態
          todo.completed = originalState
          console.error('Toggle todo error:', error)
          notification.error('更新狀態失敗，請稍後再試', '錯誤')
        }
      }
    }

    // 刪除待辦事項
    const deleteTodo = async (id) => {
      const todoToDelete = todos.value.find((t) => t.id === id)
      if (todoToDelete) {
        // 如果是本地預設資料（負數 ID），直接從本地移除
        if (id < 0) {
          todos.value = todos.value.filter((t) => t.id !== id)
          notification.error(`已從待辦事項區域移除「${todoToDelete.text}」`, '移除成功')
          return
        }

        // API 資料，呼叫 API 刪除
        try {
          const result = await todoAPI.deleteTodo(id)
          if (result.success) {
            todos.value = todos.value.filter((t) => t.id !== id)
            // 顯示移除通知（使用錯誤樣式）
            notification.error(`已從待辦事項區域移除「${todoToDelete.text}」`, '移除成功')
          }
        } catch (error) {
          console.error('Delete todo error:', error)
          notification.error('刪除失敗，請稍後再試', '錯誤')
        }
      }
    }

    // 設定篩選器
    const setFilter = (filter) => {
      currentFilter.value = filter
    }

    // 篩選後的待辦事項
    const filteredTodos = computed(() => {
      switch (currentFilter.value) {
        case 'pending':
          return todos.value.filter((todo) => !todo.completed)
        case 'completed':
          return todos.value.filter((todo) => todo.completed)
        default:
          return todos.value
      }
    })

    // 待完成項目數量
    const pendingCount = computed(() => {
      return todos.value.filter((todo) => !todo.completed).length
    })

    // 登出
    const handleLogout = async () => {
      try {
        const result = await authAPI.signOut()
        if (result.success) {
          notification.success('已成功登出', '再見')
        }
      } catch (error) {
        console.error('登出錯誤:', error)
        // 即使 API 調用失敗，也要清除本地存儲
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        // 清除本地待辦事項資料
        localStorage.removeItem('todos')
        router.push('/login')
      }
    }

    return {
      newTodo,
      currentFilter,
      todos,
      userName,
      addTodo,
      toggleTodo,
      deleteTodo,
      setFilter,
      filteredTodos,
      pendingCount,
      handleLogout,
    }
  },
}
</script>

<style scoped>
/* 空狀態樣式 */
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.2);
  text-align: center;
  width: 100%;
  z-index: 1;
}

.empty-title {
  font-size: 1.25rem;
  color: #333333;
  font-weight: normal;
  margin-bottom: 48px;
  line-height: 1.5;
}

.empty-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* 確保容器有相對定位 */
.todoListPage {
  position: relative;
}

@media (max-width: 768px) {
  .empty-state {
    transform: translate(-50%, -50%) scale(1.1);
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-image {
    max-width: 280px;
  }
}

@media (max-width: 576px) {
  .empty-state {
    transform: translate(-50%, -50%) scale(1);
  }

  .empty-image {
    max-width: 240px;
  }

  .empty-title {
    font-size: 1rem;
    margin-bottom: 32px;
  }
}
</style>
