<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useMemoDialog } from '@/composables/useMemoDialog'
import type { Widget } from '@/types/widget'
import type { MemoData } from '@/types/memo'

const props = defineProps<{ widget: Widget }>()

const { openDialog } = useMemoDialog()

const memoData = computed(() => {
  return props.widget.config as MemoData | undefined
})

const recentMemos = computed(() => {
  const memos = memoData.value?.memos || []
  const sortBy = props.widget.config?.sortBy || 'editTime'

  let sorted = [...memos]
  if (sortBy === 'editTime') {
    sorted.sort((a, b) => b.updatedAt - a.updatedAt)
  } else if (sortBy === 'createTime') {
    sorted.sort((a, b) => b.createdAt - a.createdAt)
  } else if (sortBy === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  }

  return sorted.slice(0, 3)
})

function handleClick() {
  openDialog(props.widget.id)
}
</script>

<template>
  <div
    class="w-full h-full glass-card flex flex-col p-3 cursor-pointer hover:scale-105 transition-transform"
    @click="handleClick"
  >
    <!-- 标题 -->
    <div class="flex items-center gap-2 mb-2">
      <Icon icon="mdi:note-text" class="text-lg text-gray-700 dark:text-gray-300" />
      <span class="text-sm font-medium text-gray-800 dark:text-white">
        备忘录
      </span>
    </div>

    <!-- 备忘录列表 -->
    <div class="flex-1 overflow-hidden space-y-1">
      <div
        v-for="memo in recentMemos"
        :key="memo.id"
        class="text-xs text-gray-600 dark:text-gray-400 truncate"
      >
        {{ memo.title || '无标题' }}
      </div>
      <div
        v-if="recentMemos.length === 0"
        class="text-xs text-gray-400 dark:text-gray-600 text-center py-4"
      >
        点击添加备忘录
      </div>
    </div>

    <!-- 底部标签 -->
    <div class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
      备忘录
    </div>
  </div>
</template>
