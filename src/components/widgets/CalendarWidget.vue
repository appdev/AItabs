<script setup lang="ts">
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { ref, onMounted, onUnmounted } from 'vue'
import { useClock } from '@/composables/useClock'
import type { Widget } from '@/types/widget'

dayjs.extend(dayOfYear)
dayjs.extend(isoWeek)

defineProps<{ widget: Widget }>()

// 农历复用 useClock 中的算法
const { lunarStr } = useClock()

// 日期信息每分钟刷新一次（应对跨零点场景）
const now = ref(dayjs())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => { now.value = dayjs() }, 60_000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 p-3 flex flex-col select-none">

    <!-- 顶部：年月橙色徽章 -->
    <div>
      <span class="inline-block px-2 py-0.5 rounded-full bg-orange-400 text-white text-[11px] font-medium leading-tight">
        {{ now.format('YYYY年M月') }}
      </span>
    </div>

    <!-- 中间：大号日期 -->
    <div class="flex-1 flex items-center">
      <span class="text-white font-bold leading-none" style="font-size: clamp(2.5rem, 5vw, 3.5rem)">
        {{ now.date() }}
      </span>
    </div>

    <!-- 底部：周次 / 农历 / 星期 -->
    <div class="space-y-0.5">
      <div class="text-white/70 text-[10px]">
        第 {{ now.isoWeek() }} 周 &nbsp;·&nbsp; 第 {{ now.dayOfYear() }} 天
      </div>
      <div class="flex items-center gap-1.5 text-white/90 text-[11px]">
        <span>{{ lunarStr }}</span>
        <span class="text-white/40">·</span>
        <span>{{ WEEK_NAMES[now.day()] }}</span>
      </div>
    </div>

  </div>
</template>
