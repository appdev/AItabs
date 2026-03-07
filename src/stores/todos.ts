import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TodoItem, TodoList } from '@/types/todo'
import { generateId } from '@/utils/id'
import dayjs from 'dayjs'

const DEFAULT_LIST: TodoList = {
  id: 'default',
  name: '所有',
  color: 'blue',
  order: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export const useTodosStore = defineStore('todos', () => {
  const items = ref<TodoItem[]>([])
  const lists = ref<TodoList[]>([structuredClone(DEFAULT_LIST)])
  const activeListId = ref('default')

  // ===== 计算属性 =====

  const activeTodos = computed(() => {
    if (activeListId.value === 'today') {
      return todayTodos.value
    }
    return items.value
      .filter(t => t.listId === activeListId.value && !t.deletedAt)
      .sort((a, b) => b.createdAt - a.createdAt) // 按创建时间降序（最新的在前）
  })

  const todayTodos = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return items.value
      .filter(t => !t.deletedAt && t.dueDate === today)
      .sort((a, b) => b.createdAt - a.createdAt) // 按创建时间降序（最新的在前）
  })

  const allTodos = computed(() => {
    return items.value
      .filter(t => !t.deletedAt)
      .sort((a, b) => b.createdAt - a.createdAt) // 按创建时间降序（最新的在前）
  })

  const incompleteTodos = computed(() => {
    return items.value.filter(t => !t.deletedAt && !t.completed)
  })

  const incompleteCount = computed(() => incompleteTodos.value.length)

  // ===== TodoItem CRUD =====

  function addTodo(data: Partial<TodoItem>) {
    const targetListId = data.listId ?? activeListId.value
    const maxOrder = Math.max(0, ...items.value.filter(t => t.listId === targetListId).map(t => t.order))
    items.value.push({
      id: generateId(),
      title: data.title ?? '',
      completed: false,
      listId: targetListId,
      dueDate: data.dueDate,
      priority: data.priority,
      order: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dirty: true,
    })
  }

  function updateTodo(id: string, updates: Partial<TodoItem>) {
    const todo = items.value.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, updates)
      todo.updatedAt = Date.now()
      todo.dirty = true
    }
  }

  function toggleTodo(id: string) {
    const todo = items.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      todo.updatedAt = Date.now()
      todo.dirty = true
    }
  }

  function deleteTodo(id: string) {
    const todo = items.value.find(t => t.id === id)
    if (todo) {
      todo.deletedAt = Date.now()
      todo.updatedAt = Date.now()
      todo.dirty = true
    }
  }

  function reorderTodos(newItems: TodoItem[]) {
    const now = Date.now()
    newItems.forEach((item, index) => {
      const todo = items.value.find(t => t.id === item.id)
      if (todo) {
        todo.order = index
        todo.updatedAt = now
        todo.dirty = true
      }
    })
  }

  // ===== TodoList CRUD =====

  function addList(name: string) {
    const maxOrder = Math.max(0, ...lists.value.map(l => l.order))
    const newList: TodoList = {
      id: generateId(),
      name,
      color: 'blue',
      order: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dirty: true,
    }
    lists.value.push(newList)
    return newList.id
  }

  function deleteList(id: string) {
    const list = lists.value.find(l => l.id === id)
    if (list) {
      list.deletedAt = Date.now()
      list.updatedAt = Date.now()
      list.dirty = true
    }
  }

  // ===== 同步相关 =====

  function getDirtyItems(): TodoItem[] {
    return items.value.filter(t => t.dirty)
  }

  function getDirtyLists(): TodoList[] {
    return lists.value.filter(l => l.dirty)
  }

  function applyRemoteItems(remoteItems: { id: string; data: Record<string, unknown>; updatedAt: number; deletedAt?: number | null }[]) {
    for (const item of remoteItems) {
      const idx = items.value.findIndex(t => t.id === item.id)
      const remote = { ...(item.data as unknown as TodoItem), updatedAt: item.updatedAt, deletedAt: item.deletedAt ?? null, dirty: false }

      if (item.deletedAt) {
        if (idx !== -1) items.value.splice(idx, 1)
        continue
      }

      if (idx === -1) {
        items.value.push(remote)
      }
      else if (item.updatedAt > (items.value[idx]!.updatedAt ?? 0)) {
        items.value[idx] = remote
      }
    }
  }

  function applyRemoteLists(remoteLists: { id: string; data: Record<string, unknown>; updatedAt: number; deletedAt?: number | null }[]) {
    for (const item of remoteLists) {
      const idx = lists.value.findIndex(l => l.id === item.id)
      const remote = { ...(item.data as unknown as TodoList), updatedAt: item.updatedAt, deletedAt: item.deletedAt ?? null, dirty: false }

      if (item.deletedAt) {
        if (idx !== -1) lists.value.splice(idx, 1)
        continue
      }

      if (idx === -1) {
        lists.value.push(remote)
      }
      else if (item.updatedAt > (lists.value[idx]!.updatedAt ?? 0)) {
        lists.value[idx] = remote
      }
    }
  }

  function clearDirty() {
    items.value = items.value.filter(t => !t.deletedAt).map(t => ({ ...t, dirty: false }))
    lists.value = lists.value.filter(l => !l.deletedAt).map(l => ({ ...l, dirty: false }))
  }

  return {
    items,
    lists,
    activeListId,
    activeTodos,
    todayTodos,
    allTodos,
    incompleteTodos,
    incompleteCount,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    addList,
    deleteList,
    getDirtyItems,
    getDirtyLists,
    applyRemoteItems,
    applyRemoteLists,
    clearDirty,
  }
}, {
  persist: {
    key: 'aitabs-todos',
  },
})
