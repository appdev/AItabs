<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useTodosStore } from '@/stores/todos'
import { useTodoDialog } from '@/composables/useTodoDialog'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const { visible, closeDialog } = useTodoDialog()
const todosStore = useTodosStore()

const searchQuery = ref('')
const newTodoTitle = ref('')
const showCalendar = ref(false) // 日历弹窗显示状态
const selectedMonth = ref(dayjs())
const selectedDate = ref(dayjs()) // 当前选择的日期，默认今天
const showSettingsMenu = ref(false) // 显示设置菜单

// 当前视图的待办
const currentTodos = computed(() => {
  let todos = todosStore.activeTodos

  if (searchQuery.value) {
    todos = todos.filter(t => t.title.includes(searchQuery.value))
  }

  return todos
})

// 添加待办
function addTodo() {
  if (!newTodoTitle.value.trim())
    return

  todosStore.addTodo({
    title: newTodoTitle.value.trim(),
    dueDate: selectedDate.value.format('YYYY-MM-DD'), // 使用选择的日期
  })

  newTodoTitle.value = ''
}

// 选择日期
function selectDate(date: dayjs.Dayjs) {
  selectedDate.value = date
  showCalendar.value = false // 选择后关闭日历
}

// 切换列表
function selectList(listId: string) {
  todosStore.activeListId = listId
  // 如果不是今天列表，切换时重置选中日期为今天
  if (listId !== 'today') {
    selectedDate.value = dayjs()
  }
}

// 清理已完成
function clearCompleted() {
  const completedItems = todosStore.items.filter(t => t.completed && !t.deletedAt)
  if (completedItems.length === 0) {
    alert('没有已完成的任务')
    return
  }
  if (confirm(`确定要清理 ${completedItems.length} 个已完成的任务吗？`)) {
    completedItems.forEach(item => {
      todosStore.deleteTodo(item.id)
    })
  }
}

// 今天的日期显示
const todayDisplay = computed(() => {
  const today = dayjs()
  return `${today.format('YYYY-MM-DD')} ${today.format('dddd')}`
})

// 处理键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addTodo()
  }
}

// 日历相关
const calendarDays = computed(() => {
  const start = selectedMonth.value.startOf('month').startOf('week')
  const end = selectedMonth.value.endOf('month').endOf('week')
  const days: Array<{ date: dayjs.Dayjs; isCurrentMonth: boolean; isToday: boolean }> = []

  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push({
      date: current,
      isCurrentMonth: current.month() === selectedMonth.value.month(),
      isToday: current.isSame(dayjs(), 'day'),
    })
    current = current.add(1, 'day')
  }

  return days
})

function previousMonth() {
  selectedMonth.value = selectedMonth.value.subtract(1, 'month')
}

function nextMonth() {
  selectedMonth.value = selectedMonth.value.add(1, 'month')
}

function previousYear() {
  selectedMonth.value = selectedMonth.value.subtract(1, 'year')
}

function nextYear() {
  selectedMonth.value = selectedMonth.value.add(1, 'year')
}

function isOverdue(dueDate?: string) {
  if (!dueDate)
    return false
  return dayjs(dueDate).isBefore(dayjs(), 'day')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[900] flex items-center justify-center p-8"
        @click.self="closeDialog(); showCalendar = false; showSettingsMenu = false"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="closeDialog(); showCalendar = false; showSettingsMenu = false" />

        <!-- 对话框主体 -->
        <div class="relative w-[1000px] h-[602px] rounded-[20px] overflow-hidden glass-dialog pt-[48px]">
          <!-- 顶部工具栏 -->
          <DialogTitleBar title="待办事项" fixed @close="closeDialog" />

          <div class="flex h-full" @click="showCalendar = false">
            <!-- 左侧边栏 -->
            <div class="todo-sidebar w-56 border-r border-black/8 dark:border-white/5 flex flex-col">
              <!-- 搜索框 -->
              <div class="p-4">
                <div class="relative">
                  <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 text-lg" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search"
                    class="todo-input w-full pl-10 pr-3 py-2 border border-black/10 dark:border-white/5 rounded-lg outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-black/20 dark:focus:border-white/10 transition-colors"
                  >
                </div>
              </div>

              <!-- 智能列表 -->
              <div class="flex-1 px-3 overflow-y-auto">
                <div class="space-y-1">
                  <!-- 今天 -->
                  <div
                    class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
                    :class="todosStore.activeListId === 'today' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'text-gray-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'"
                    @click="selectList('today')"
                  >
                    <div class="flex items-center gap-3">
                      <Icon icon="mdi:calendar-today" class="text-lg" />
                      <span class="text-sm font-medium">今天</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="todosStore.activeListId === 'today' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'">
                      {{ todosStore.todayTodos.length }}
                    </span>
                  </div>

                  <!-- 所有 -->
                  <div
                    class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
                    :class="todosStore.activeListId === 'default' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'text-gray-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'"
                    @click="selectList('default')"
                  >
                    <div class="flex items-center gap-3">
                      <Icon icon="mdi:inbox" class="text-lg" />
                      <span class="text-sm font-medium">所有</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="todosStore.activeListId === 'default' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'">
                      {{ todosStore.allTodos.length }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 底部操作栏 -->
              <div class="p-3 border-t border-black/8 dark:border-white/5 relative">
                <div class="flex items-center justify-end">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    @click="showSettingsMenu = !showSettingsMenu"
                  >
                    <Icon icon="mdi:cog-outline" class="text-gray-500 dark:text-white/60 text-lg" />
                  </button>
                </div>

                <!-- 设置菜单 -->
                <Transition name="menu-fade">
                  <div
                    v-if="showSettingsMenu"
                    class="glass-menu absolute bottom-full right-3 mb-2 rounded-lg overflow-hidden min-w-[160px]"
                    @click="showSettingsMenu = false"
                  >
                    <button
                      type="button"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      @click="clearCompleted"
                    >
                      <Icon icon="mdi:check-all" class="text-lg" />
                      <span>清理已完成</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- 中间主内容区 -->
            <div class="flex-1 flex flex-col">
              <!-- 标题栏 -->
              <div class="px-8 py-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ todosStore.activeListId === 'today' ? '今天' : todosStore.activeListId === 'default' ? '所有' : todosStore.lists.find(l => l.id === todosStore.activeListId)?.name }}
                  </h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-white/40">
                  {{ todayDisplay }}
                </p>
              </div>

              <!-- 添加任务 -->
              <div class="px-8 py-4 relative">
                <div class="todo-add-box flex items-center gap-3 p-3 rounded-xl border border-black/10 dark:border-white/5">
                  <Icon icon="mdi:plus" class="text-gray-400 dark:text-white/40 text-xl flex-shrink-0" />
                  <input
                    v-model="newTodoTitle"
                    type="text"
                    placeholder="添加任务"
                    class="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
                    @keydown="handleKeydown"
                  >
                  <!-- 日历按钮容器 -->
                  <div class="relative flex-shrink-0">
                    <button
                      ref="calendarButtonRef"
                      type="button"
                      class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      :class="showCalendar ? 'bg-[#007AFF]/20 text-[#007AFF]' : 'text-gray-400 dark:text-white/40'"
                      aria-label="选择日期"
                      @click.stop="showCalendar = !showCalendar"
                    >
                      <Icon icon="mdi:calendar-outline" class="text-lg" />
                    </button>

                    <!-- 日历弹窗 - 出现在按钮下方 -->
                    <Transition name="calendar-fade">
                      <div
                        v-if="showCalendar"
                        class="glass-menu absolute top-full right-0 mt-2 w-[322px] rounded-2xl p-4 z-50"
                        @click.stop
                      >
                        <!-- 月份导航 -->
                        <div class="flex items-center justify-between mb-4">
                          <button
                            type="button"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            @click="previousYear"
                          >
                            <Icon icon="mdi:chevron-double-left" class="text-gray-500 dark:text-white/60 text-base" />
                          </button>
                          <button
                            type="button"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            @click="previousMonth"
                          >
                            <Icon icon="mdi:chevron-left" class="text-gray-500 dark:text-white/60 text-base" />
                          </button>
                          <span class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ selectedMonth.format('YYYY 年 M 月') }}
                          </span>
                          <button
                            type="button"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            @click="nextMonth"
                          >
                            <Icon icon="mdi:chevron-right" class="text-gray-500 dark:text-white/60 text-base" />
                          </button>
                          <button
                            type="button"
                            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            @click="nextYear"
                          >
                            <Icon icon="mdi:chevron-double-right" class="text-gray-500 dark:text-white/60 text-base" />
                          </button>
                        </div>

                        <!-- 星期标题 -->
                        <div class="grid grid-cols-7 gap-1 mb-2">
                          <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-center text-xs text-gray-400 dark:text-white/40 py-1.5">
                            {{ day }}
                          </div>
                        </div>

                        <!-- 日期网格 -->
                        <div class="grid grid-cols-7 gap-1">
                          <button
                            v-for="(day, index) in calendarDays"
                            :key="index"
                            type="button"
                            class="aspect-square flex items-center justify-center rounded-lg text-xs transition-colors"
                            :class="{
                              'text-gray-300 dark:text-white/30': !day.isCurrentMonth,
                              'text-gray-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5': day.isCurrentMonth && !day.isToday && !day.date.isSame(selectedDate, 'day'),
                              'bg-[#007AFF] text-white font-semibold': day.date.isSame(selectedDate, 'day'),
                              'ring-2 ring-[#007AFF] ring-offset-2': day.isToday && !day.date.isSame(selectedDate, 'day'),
                            }"
                            style="--tw-ring-offset-color: transparent;"
                            @click="selectDate(day.date)"
                          >
                            {{ day.date.date() }}
                          </button>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- 显示当前选择的日期 -->
                <div v-if="!selectedDate.isSame(dayjs(), 'day')" class="flex items-center gap-2 mt-3 text-sm text-[#007AFF]">
                  <Icon icon="mdi:calendar-outline" class="text-base" />
                  <span>{{ selectedDate.format('YYYY-MM-DD') }}</span>
                  <button
                    type="button"
                    class="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    @click="selectedDate = dayjs()"
                  >
                    <Icon icon="mdi:close" class="text-xs" />
                  </button>
                </div>
              </div>

              <!-- 任务列表 -->
              <div class="flex-1 overflow-y-auto px-8 py-4">
                <div class="space-y-2">
                  <div
                    v-for="todo in currentTodos"
                    :key="todo.id"
                    class="todo-item group flex items-start gap-3 p-3 rounded-xl border border-black/10 dark:border-white/5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="todo.completed"
                      class="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 dark:border-white/20 checked:bg-[#007AFF] checked:border-[#007AFF] cursor-pointer transition-colors flex-shrink-0"
                      @change="todosStore.toggleTodo(todo.id)"
                    >
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm"
                        :class="todo.completed ? 'line-through text-gray-400 dark:text-white/30' : 'text-gray-900 dark:text-white/90'"
                      >
                        {{ todo.title }}
                      </p>
                      <div v-if="todo.dueDate" class="flex items-center gap-2 mt-1">
                        <Icon icon="mdi:calendar-outline" class="text-xs flex-shrink-0" :class="isOverdue(todo.dueDate) ? 'text-[#FF453A]' : 'text-gray-400 dark:text-white/40'" />
                        <span
                          class="text-xs"
                          :class="isOverdue(todo.dueDate) ? 'text-[#FF453A]' : 'text-gray-500 dark:text-white/40'"
                        >
                          {{ todo.dueDate === dayjs().format('YYYY-MM-DD') ? '今天' : todo.dueDate }}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-white/30 hover:text-[#FF453A] transition-all flex-shrink-0"
                      @click="todosStore.deleteTodo(todo.id)"
                    >
                      <Icon icon="mdi:delete-outline" class="text-lg" />
                    </button>
                  </div>

                  <div v-if="currentTodos.length === 0" class="text-center py-20">
                    <Icon icon="mdi:checkbox-marked-circle-outline" class="text-6xl text-gray-200 dark:text-white/10 mb-4 mx-auto" />
                    <p class="text-sm text-gray-400 dark:text-white/30">
                      暂无待办事项
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

/* 日历弹窗过渡动画 */
.calendar-fade-enter-active,
.calendar-fade-leave-active {
  transition: all 0.2s ease;
}

.calendar-fade-enter-from,
.calendar-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 设置菜单过渡动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* 自定义滚动条 - macOS 风格 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 自定义 checkbox 样式 */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
}

/* 侧边栏半透明背景 */
.todo-sidebar {
  background: rgba(0, 0, 0, 0.03);
}

.dark .todo-sidebar {
  background: rgba(0, 0, 0, 0.2);
}

/* 输入框半透明背景 */
.todo-input {
  background: rgba(0, 0, 0, 0.03);
}

.dark .todo-input {
  background: rgba(255, 255, 255, 0.05);
}

.todo-input:focus {
  background: rgba(0, 0, 0, 0.05);
}

.dark .todo-input:focus {
  background: rgba(255, 255, 255, 0.08);
}

/* 添加任务输入框 */
.todo-add-box {
  background: rgba(0, 0, 0, 0.03);
}

.dark .todo-add-box {
  background: rgba(255, 255, 255, 0.05);
}

/* 任务卡片 */
.todo-item {
  background: rgba(0, 0, 0, 0.02);
}

.dark .todo-item {
  background: rgba(255, 255, 255, 0.03);
}

.todo-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .todo-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
</style>
