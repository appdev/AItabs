<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodosStore } from '@/stores/todos'
import { useTodoDialog } from '@/composables/useTodoDialog'
import type { Widget } from '@/types/widget'

const props = defineProps<{ widget: Widget }>()

const todosStore = useTodosStore()
const { openDialog } = useTodoDialog()

// 显示前3个未完成的待办
const displayTodos = computed(() => {
  return todosStore.incompleteTodos.slice(0, 3)
})

const incompleteCount = computed(() => todosStore.incompleteCount)

function handleClick() {
  openDialog()
}

function handleToggle(id: string, event: Event) {
  event.stopPropagation()
  todosStore.toggleTodo(id)
}
</script>

<template>
  <div
    class="w-full h-full glass-card flex flex-col p-3 cursor-pointer hover:scale-105 transition-transform"
    @click="handleClick"
  >
    <!-- 头部：徽章 + 标题 -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {{ incompleteCount }}
        </div>
        <span class="text-sm font-medium text-gray-800 dark:text-white">待办事项</span>
      </div>
    </div>

    <!-- 待办列表 -->
    <div class="flex-1 space-y-1.5 overflow-hidden">
      <div
        v-for="todo in displayTodos"
        :key="todo.id"
        class="flex items-center gap-2 text-xs"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-0 cursor-pointer"
          @click="(e) => handleToggle(todo.id, e)"
        >
        <span
          class="flex-1 truncate"
          :class="todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'"
        >
          {{ todo.title }}
        </span>
      </div>

      <div v-if="displayTodos.length === 0" class="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
        暂无待办事项
      </div>
    </div>

    <!-- 底部标签 -->
    <div class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
      待办事项
    </div>
  </div>
</template>
