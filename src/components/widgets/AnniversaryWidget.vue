<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Widget } from '@/types/widget'
import type { AnniversaryConfig } from '@/types/anniversary'
import { DEFAULT_ANNIVERSARY_CONFIG } from '@/types/anniversary'
import { useAnniversaryDialog } from '@/composables/useAnniversaryDialog'

const props = defineProps<{ widget: Widget }>()

const { openDialog } = useAnniversaryDialog()

const config = computed<AnniversaryConfig>(() => {
  return props.widget.data?.config || DEFAULT_ANNIVERSARY_CONFIG
})

// 点击打开配置对话框
function handleClick() {
  openDialog(props.widget.id)
}

// 每天刷新一次（跨零点更新天数）
const today = ref(dayjs())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => { today.value = dayjs() }, 60_000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const days = computed(() => {
  const start = dayjs(config.value.startDate)
  return Math.max(0, today.value.diff(start, 'day'))
})

// 千分位格式
const formattedDays = computed(() => days.value.toLocaleString('zh-CN'))
</script>

<template>
  <div class="w-full h-full glass-card p-3 flex flex-col select-none text-gray-800 dark:text-white cursor-pointer hover:scale-105 transition-transform" @click="handleClick">

    <!-- 标题 -->
    <div class="text-gray-600 dark:text-gray-300 text-xs leading-tight">{{ config.title }}</div>

    <!-- 天数大字 -->
    <div class="flex-1 flex items-center gap-1">
      <span
        class="font-bold leading-none tabular-nums"
        style="font-size: clamp(2rem, 4vw, 2.5rem)"
      >
        {{ formattedDays }}
      </span>
      <span class="text-gray-500 dark:text-gray-400 text-base self-end mb-0.5">天</span>
    </div>

    <!-- 起始日期 -->
    <div class="text-gray-400 dark:text-gray-500 text-[10px]">自 {{ config.startDate }}</div>

  </div>
</template>
