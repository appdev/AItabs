<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useMemoDialog } from '@/composables/useMemoDialog'
import { useWidgetsStore } from '@/stores/widgets'
import { generateId } from '@/utils/id'
import dayjs from 'dayjs'
import type { Memo, MemoData } from '@/types/memo'

const { visible, widgetId, closeDialog } = useMemoDialog()
const widgetsStore = useWidgetsStore()

const searchQuery = ref('')
const selectedMemoId = ref('')

const widget = computed(() => {
  return widgetsStore.widgets.find(w => w.id === widgetId.value)
})

const memoData = computed(() => {
  return widget.value?.data as MemoData | undefined
})

const memos = computed(() => {
  return memoData.value?.memos || []
})

const selectedMemo = computed(() => {
  if (!selectedMemoId.value && memos.value.length > 0) {
    selectedMemoId.value = memos.value[0].id
  }
  return memos.value.find(m => m.id === selectedMemoId.value)
})

const filteredMemos = computed(() => {
  if (!searchQuery.value) return memos.value

  const query = searchQuery.value.toLowerCase()
  return memos.value.filter(m =>
    m.title.toLowerCase().includes(query) ||
    m.content.toLowerCase().includes(query)
  )
})

// 监听 widget 变化，初始化选中的备忘录和默认数据
watch(() => widgetId.value, (newId) => {
  if (newId) {
    // 如果没有备忘录数据，初始化一个默认备忘录
    if (!memoData.value || memos.value.length === 0) {
      const defaultMemo: Memo = {
        id: generateId(),
        title: 'AItabs 使用技巧',
        content: '1. 双击组件可以打开详细设置\n2. 右键点击可以编辑或删除组件\n3. 拖拽组件可以调整位置\n4. 点击右上角可以添加新组件',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      updateData({ memos: [defaultMemo], selectedMemoId: defaultMemo.id })
      selectedMemoId.value = defaultMemo.id
    } else {
      const data = memoData.value
      selectedMemoId.value = data?.selectedMemoId || memos.value[0]?.id || ''
    }
  }
}, { immediate: true })

// ESC 键关闭对话框
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    closeDialog()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function selectMemo(memoId: string) {
  selectedMemoId.value = memoId
  updateData({ selectedMemoId: memoId })
}

function addMemo() {
  const newMemo: Memo = {
    id: generateId(),
    title: '新备忘录',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const newMemos = [...memos.value, newMemo]
  updateData({ memos: newMemos, selectedMemoId: newMemo.id })
  selectedMemoId.value = newMemo.id
}

function deleteMemo() {
  if (!selectedMemo.value) return

  if (memos.value.length === 1) {
    alert('至少保留一个备忘录')
    return
  }

  if (!confirm(`确定要删除备忘录"${selectedMemo.value.title}"吗？`)) {
    return
  }

  const newMemos = memos.value.filter(m => m.id !== selectedMemoId.value)
  const newSelectedId = newMemos[0]?.id || ''

  updateData({ memos: newMemos, selectedMemoId: newSelectedId })
  selectedMemoId.value = newSelectedId
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function updateMemoContent(field: 'title' | 'content', value: string) {
  if (!selectedMemo.value) return

  // 清除之前的定时器
  if (saveTimer) clearTimeout(saveTimer)

  // 防抖保存
  saveTimer = setTimeout(() => {
    const newMemos = memos.value.map(m => {
      if (m.id === selectedMemoId.value) {
        return {
          ...m,
          [field]: value,
          updatedAt: Date.now(),
        }
      }
      return m
    })

    updateData({ memos: newMemos })
  }, 500)
}

function updateData(updates: Partial<MemoData>) {
  if (!widget.value) return

  const currentData = memoData.value || { memos: [], updatedAt: Date.now() }
  widgetsStore.updateWidget(widget.value.id, {
    data: {
      ...currentData,
      ...updates,
      updatedAt: Date.now(),
    }
  })
}

function formatTime(timestamp: number) {
  return dayjs(timestamp).format('YYYY/M/D HH:mm')
}

function formatFullTime(timestamp: number) {
  return dayjs(timestamp).format('YYYY-M-D HH:mm:ss')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[900] flex items-center justify-center"
        @click.self="closeDialog"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="closeDialog" />

        <!-- 对话框主体 -->
        <div class="relative w-[900px] h-[650px] rounded-[20px] overflow-hidden glass-dialog">
          <!-- 顶部工具栏 -->
          <DialogTitleBar title="备忘录" fixed @close="closeDialog" />

          <div class="flex h-full pt-12">
            <!-- 左侧备忘录列表 -->
            <div class="memo-sidebar w-64 border-r border-black/8 dark:border-white/5 flex flex-col">
              <!-- 搜索框 -->
              <div class="p-3 border-b border-black/8 dark:border-white/5">
                <div class="relative">
                  <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 text-lg" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索备忘录"
                    class="memo-input w-full pl-10 pr-3 py-2 border border-black/10 dark:border-white/5 rounded-lg outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 transition-colors"
                  >
                </div>
              </div>

              <!-- 备忘录列表 -->
              <div class="flex-1 overflow-y-auto p-2">
                <div
                  v-for="memo in filteredMemos"
                  :key="memo.id"
                  class="mb-1 px-3 py-2 rounded-lg cursor-pointer transition-all"
                  :class="selectedMemoId === memo.id ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'"
                  @click="selectMemo(memo.id)"
                >
                  <p class="text-sm font-medium truncate">{{ memo.title || '无标题' }}</p>
                  <p class="text-xs opacity-70 mt-0.5">{{ formatTime(memo.updatedAt) }}</p>
                </div>

                <div v-if="filteredMemos.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                  暂无备忘录
                </div>
              </div>

              <!-- 底部操作栏 -->
              <div class="p-3 border-t border-black/8 dark:border-white/5">
                <button
                  type="button"
                  class="w-full px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0066CC] transition-colors flex items-center justify-center gap-2"
                  @click="addMemo"
                >
                  <Icon icon="mdi:plus" class="text-lg" />
                  <span class="text-sm">新增备忘录</span>
                </button>
              </div>
            </div>

            <!-- 右侧内容区 -->
            <div class="flex-1 flex flex-col">
              <div v-if="selectedMemo" class="flex-1 flex flex-col">
                <!-- 头部信息 -->
                <div class="px-6 py-4 border-b border-black/8 dark:border-white/5">
                  <input
                    :value="selectedMemo.title"
                    type="text"
                    placeholder="请输入笔记标题"
                    class="memo-title-input w-full text-xl font-bold bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
                    @input="e => updateMemoContent('title', (e.target as HTMLInputElement).value)"
                  >
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    最后编辑：{{ formatTime(selectedMemo.updatedAt) }}
                  </p>
                </div>

                <!-- 操作按钮栏 -->
                <div class="px-6 py-3 border-b border-black/8 dark:border-white/5 flex items-center gap-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-sm text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors flex items-center gap-1"
                    @click="deleteMemo"
                  >
                    <Icon icon="mdi:delete-outline" class="text-base" />
                    <span>删除</span>
                  </button>
                </div>

                <!-- 编辑区域 -->
                <div class="flex-1 px-6 py-4 overflow-y-auto">
                  <textarea
                    :value="selectedMemo.content"
                    placeholder="请输入笔记内容"
                    class="memo-content-textarea w-full h-full resize-none bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/40 leading-relaxed"
                    @input="e => updateMemoContent('content', (e.target as HTMLTextAreaElement).value)"
                  />
                </div>

                <!-- 底部信息 -->
                <div class="px-6 py-3 border-t border-black/8 dark:border-white/5">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    创建：{{ formatFullTime(selectedMemo.createdAt) }} ·
                    最后编辑：{{ formatFullTime(selectedMemo.updatedAt) }}
                  </p>
                </div>
              </div>

              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <Icon icon="mdi:note-text-outline" class="text-6xl text-gray-300 dark:text-gray-700 mb-4 mx-auto" />
                  <p class="text-gray-400 dark:text-gray-600">请选择或新建备忘录</p>
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

/* 侧边栏半透明背景 */
.memo-sidebar {
  background: rgba(0, 0, 0, 0.03);
}

.dark .memo-sidebar {
  background: rgba(0, 0, 0, 0.2);
}

/* 输入框半透明背景 */
.memo-input {
  background: rgba(0, 0, 0, 0.03);
}

.dark .memo-input {
  background: rgba(255, 255, 255, 0.05);
}

.memo-input:focus {
  background: rgba(0, 0, 0, 0.05);
}

.dark .memo-input:focus {
  background: rgba(255, 255, 255, 0.08);
}

/* 标题输入框 */
.memo-title-input::placeholder {
  opacity: 0.5;
}

/* 内容文本域 */
.memo-content-textarea::placeholder {
  opacity: 0.5;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
