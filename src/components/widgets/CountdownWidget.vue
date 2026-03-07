<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import type { Widget } from '@/types/widget'
import type { CountdownConfig } from '@/types/countdown'
import { DEFAULT_COUNTDOWN_CONFIG } from '@/types/countdown'
import { useCountdownDialog } from '@/composables/useCountdownDialog'

const props = defineProps<{
  widget: Widget
}>()

const { openDialog } = useCountdownDialog()

const config = computed<CountdownConfig>(() => {
  return props.widget.data?.config || DEFAULT_COUNTDOWN_CONFIG
})

// 点击打开配置对话框
function handleClick() {
  openDialog(props.widget.id)
}

const now = ref(dayjs())
let timer: ReturnType<typeof setInterval> | null = null

const workEnd = computed(() => {
  const [h, m] = config.value.offWorkTime.split(':').map(Number)
  return { hour: h ?? 18, minute: m ?? 0 }
})

const countdown = computed(() => {
  const target = dayjs().hour(workEnd.value.hour).minute(workEnd.value.minute).second(0)
  if (now.value.isAfter(target)) return '00:00:00'
  const diff = target.diff(now.value)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const payDays = computed(() => {
  const d = now.value
  const day = config.value.payDay
  const next = d.date() < day ? d.date(day) : d.add(1, 'month').date(day)
  return Math.max(0, Math.ceil(next.diff(d, 'day', true)))
})

const nextHoliday = computed(() => {
  // 如果配置了自定义假期，优先使用
  if (config.value.holiday?.name && config.value.holiday?.date) {
    const customDate = dayjs(config.value.holiday.date)
    if (customDate.isAfter(now.value)) {
      return {
        name: config.value.holiday.name,
        days: Math.max(0, Math.ceil(customDate.diff(now.value, 'day', true))),
      }
    }
  }

  // 否则使用默认假期列表
  const year = now.value.year()
  const candidates = [
    { name: '清明节', date: dayjs(`${year}-04-04`) },
    { name: '劳动节', date: dayjs(`${year}-05-01`) },
    { name: '端午节', date: dayjs(`${year}-06-10`) },
    { name: '国庆节', date: dayjs(`${year}-10-01`) },
    { name: '元旦',   date: dayjs(`${year + 1}-01-01`) },
  ]
  const next = candidates.find(h => h.date.isAfter(now.value)) ?? candidates[candidates.length - 1]!
  return { name: next.name, days: Math.max(0, Math.ceil(next.date.diff(now.value, 'day', true))) }
})

// 动态计算当月工作日数（周一至周五）
const workdaysThisMonth = computed(() => {
  const d = now.value
  const daysInMonth = d.daysInMonth()
  let count = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = dayjs(new Date(d.year(), d.month(), day)).day()
    if (dow !== 0 && dow !== 6) count++ // 排除周六(6)和周日(0)
  }
  return count
})

// 今日收入 = (月薪 / 当月工作日数) × (已过工时 / 8)
// 已过工时：从 9:00 开始，最多累计 8 小时
const todayEarnings = computed(() => {
  const currentHour = now.value.hour() + now.value.minute() / 60
  const workedHours = Math.min(8, Math.max(0, currentHour - 9))
  const daily = config.value.salary / workdaysThisMonth.value
  return (daily * workedHours / 8).toFixed(2)
})

onMounted(() => {
  timer = setInterval(() => { now.value = dayjs() }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="w-full h-full glass-card flex p-3 gap-3 cursor-pointer hover:scale-105 transition-transform" @click="handleClick">
    <!-- 左侧：倒计时 + 猫咪（约 60%） -->
    <div class="flex-1 flex flex-col justify-between min-w-0">
      <div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">下班还有</div>
        <div
          class="font-mono font-light text-gray-800 dark:text-gray-100 tabular-nums"
          style="font-size: clamp(1.4rem, 3.5vw, 2rem)"
        >
          {{ countdown }}
        </div>
      </div>
      <!-- 猫咪装饰 -->
      <div class="text-3xl opacity-70 select-none">🐱</div>
    </div>

    <!-- 右侧：3 个迷你卡片（约 40%） -->
    <div class="flex flex-col gap-1.5 justify-center w-[40%] flex-shrink-0">
      <!-- 发薪日 -->
      <div v-if="config.display.showSalary" class="px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/10">
        <div class="text-gray-500 dark:text-gray-400 text-[10px] leading-none mb-0.5">发薪</div>
        <div class="text-gray-800 dark:text-gray-200 text-xs font-medium">{{ payDays }} 天</div>
      </div>
      <!-- 节日倒计时 -->
      <div v-if="config.display.showHoliday" class="px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/10">
        <div class="text-gray-500 dark:text-gray-400 text-[10px] leading-none mb-0.5">{{ nextHoliday.name }}</div>
        <div class="text-gray-800 dark:text-gray-200 text-xs font-medium">{{ nextHoliday.days }} 天</div>
      </div>
      <!-- 今日收入 -->
      <div v-if="config.display.showIncome" class="px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/10">
        <div class="text-gray-500 dark:text-gray-400 text-[10px] leading-none mb-0.5">今天赚了</div>
        <div class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">¥{{ todayEarnings }}</div>
      </div>
    </div>

  </div>
</template>
