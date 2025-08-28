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
        <li><a href="#" @click="handleLogout">登出</a></li>
      </ul>
    </nav>
    <div class="conatiner todoListPage vhContainer">
      <div class="todoList_Content">
        <div class="inputBox">
          <input
            type="text"
            placeholder="請輸入待辦事項"
            v-model="newTodo"
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
import { authAPI } from '@/services/api'
import { notification } from '@/services/notification'

export default {
  name: 'TodoListPage',
  setup() {
    const router = useRouter()
    const newTodo = ref('')
    const currentFilter = ref('all')
    const todos = ref([])
    const userName = ref('')

    // 預設待辦事項
    const defaultTodos = [
      { id: 1, text: '把冰箱裡昨天的廚餘拿去丟', completed: true },
      { id: 2, text: '打電話給通知爸媽下禮拜一起吃飯', completed: false },
      { id: 3, text: '幫同學組高階電腦', completed: false },
      { id: 4, text: '繳網路費、電費、水費、電信費、瓦斯費', completed: true },
      { id: 5, text: '約協志禮拜五晚上去看2266演唱會', completed: false },
    ]

    // 從 localStorage 載入資料
    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.email) {
        router.push('/login')
        return
      }
      userName.value = user.name || user.email.split('@')[0]

      // 載入待辦事項，如果沒有則使用預設資料
      const savedTodos = JSON.parse(localStorage.getItem('todos') || 'null')
      if (savedTodos === null) {
        // 首次使用，載入預設待辦事項
        todos.value = [...defaultTodos]
        saveTodos()
      } else {
        todos.value = savedTodos
      }
    })

    // 儲存待辦事項到 localStorage
    const saveTodos = () => {
      localStorage.setItem('todos', JSON.stringify(todos.value))
    }

    // 新增待辦事項
    const addTodo = () => {
      if (newTodo.value.trim()) {
        const todoText = newTodo.value.trim()
        // 確保 ID 不會與現有項目衝突
        const maxId = todos.value.length > 0 ? Math.max(...todos.value.map((t) => t.id)) : 0
        const todo = {
          id: Math.max(maxId + 1, Date.now()),
          text: todoText,
          completed: false,
        }
        todos.value.push(todo)
        newTodo.value = ''
        saveTodos()

        // 顯示成功通知
        notification.success(`成功將「${todoText}」加入待辦事項區域`)
      }
    }

    // 切換待辦事項狀態
    const toggleTodo = (id) => {
      const todo = todos.value.find((t) => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        saveTodos()
      }
    }

    // 刪除待辦事項
    const deleteTodo = (id) => {
      const todoToDelete = todos.value.find((t) => t.id === id)
      if (todoToDelete) {
        todos.value = todos.value.filter((t) => t.id !== id)
        saveTodos()

        // 顯示移除通知（使用錯誤樣式）
        notification.error(`已從待辦事項區域移除「${todoToDelete.text}」`, '移除成功')
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
