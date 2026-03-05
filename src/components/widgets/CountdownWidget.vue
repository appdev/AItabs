<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import type { Widget } from '@/types/widget'

const props = defineProps<{
  widget: Widget
}>()

// 从 widget.config 读取配置，提供默认值
const config = computed(() => ({
  offWork: (props.widget.config.offWork as string) ?? '18:00',
  salary: (props.widget.config.salary as number) ?? 10000,
  payDay: (props.widget.config.payDay as number) ?? 10,
}))

const now = ref(dayjs())
let timer: ReturnType<typeof setInterval> | null = null

const workEnd = computed(() => {
  const [h, m] = config.value.offWork.split(':').map(Number)
  return { hour: h ?? 18, minute: m ?? 0 }
})

const countdown = computed(() => {
  let target = dayjs().hour(workEnd.value.hour).minute(workEnd.value.minute).second(0)
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
  const year = now.value.year()
  const candidates = [
    { name: '清明节', date: dayjs(`${year}-04-04`) },
    { name: '劳动节', date: dayjs(`${year}-05-01`) },
    { name: '端午节', date: dayjs(`${year}-06-10`) },
    { name: '国庆节', date: dayjs(`${year}-10-01`) },
    { name: '元旦', date: dayjs(`${year + 1}-01-01`) },
  ]
  const next = candidates.find(h => h.date.isAfter(now.value)) ?? candidates[candidates.length - 1]!
  return { name: next.name, days: Math.max(0, Math.ceil(next.date.diff(now.value, 'day', true))) }
})

// 今日收入：月薪 / 22工作日 * 已过工时比例（9点到下班时间）
const todayEarnings = computed(() => {
  const startHour = 9
  const endHour = workEnd.value.hour + workEnd.value.minute / 60
  const currentHour = now.value.hour() + now.value.minute() / 60
  const ratio = Math.min(1, Math.max(0, (currentHour - startHour) / (endHour - startHour)))
  const daily = config.value.salary / 22
  return (ratio * daily).toFixed(0)
})

onMounted(() => {
  timer = setInterval(() => { now.value = dayjs() }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="w-full h-full flex bg-gradient-to-br from-rose-100/90 via-pink-50/80 to-amber-50/70 p-4">
    <!-- 左侧：倒计时主体 -->
    <div class="flex-1 flex flex-col justify-center min-w-0">
      <div class="text-sm text-gray-600 mb-1">下班还有</div>
      <div class="text-4xl font-mono font-light text-gray-800 tabular-nums">{{ countdown }}</div>
      <div class="flex flex-wrap gap-2 mt-4">
        <div class="px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-sm">
          <div class="text-gray-500 text-xs">发工资倒计时</div>
          <div class="font-medium text-gray-800">{{ payDays }} 天</div>
        </div>
        <div class="px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-sm">
          <div class="text-gray-500 text-xs">{{ nextHoliday.name }}</div>
          <div class="font-medium text-gray-800">{{ nextHoliday.days }} 天</div>
        </div>
        <div class="px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-sm">
          <div class="text-gray-500 text-xs">今日摸鱼收益</div>
          <div class="font-medium text-emerald-600">¥{{ todayEarnings }}</div>
        </div>
      </div>
    </div>
    <!-- 右侧：猫咪装饰 -->
    <div class="flex flex-col justify-center items-center w-20 shrink-0 text-5xl opacity-80">
      🐱
    </div>
  </div>
</template>
