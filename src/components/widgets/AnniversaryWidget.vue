<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Widget } from '@/types/widget'

const props = defineProps<{ widget: Widget }>()

const config = computed(() => ({
  startDate: (props.widget.config.startDate as string) ?? '1997-10-01',
  title: (props.widget.config.title as string) ?? '你在世界已经',
}))

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
  <div class="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 p-3 flex flex-col select-none">

    <!-- 标题 -->
    <div class="text-white/80 text-xs leading-tight">{{ config.title }}</div>

    <!-- 天数大字 -->
    <div class="flex-1 flex items-center gap-1">
      <span
        class="text-white font-bold leading-none tabular-nums"
        style="font-size: clamp(2rem, 4vw, 2.5rem)"
      >
        {{ formattedDays }}
      </span>
      <span class="text-white/70 text-base self-end mb-0.5">天</span>
    </div>

    <!-- 起始日期 -->
    <div class="text-white/50 text-[10px]">自 {{ config.startDate }}</div>

  </div>
</template>
