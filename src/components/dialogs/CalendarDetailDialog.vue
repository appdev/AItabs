<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import dayjs, { Dayjs } from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useCalendarDetailDialog } from '@/composables/useCalendarDetailDialog'
import { useClock } from '@/composables/useClock'

dayjs.extend(dayOfYear)
dayjs.extend(isoWeek)

const { visible, selectedDate, closeDialog } = useCalendarDetailDialog()
const { getLunarDate } = useClock()

// 当前显示的年月
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month())

// 选中的日期
const selected = ref(dayjs())

// 监听外部传入的日期
watch(selectedDate, (newDate) => {
  const d = dayjs(newDate)
  selected.value = d
  currentYear.value = d.year()
  currentMonth.value = d.month()
})

// 当前月份的第一天和最后一天
const firstDay = computed(() => dayjs().year(currentYear.value).month(currentMonth.value).startOf('month'))
const lastDay = computed(() => dayjs().year(currentYear.value).month(currentMonth.value).endOf('month'))

// 日历网格数据（包含上月末尾和下月开头的日期）
const calendarDays = computed(() => {
  const days: Dayjs[] = []
  const start = firstDay.value.startOf('week') // 从周日开始
  const end = lastDay.value.endOf('week')

  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push(current)
    current = current.add(1, 'day')
  }

  return days
})

// 选中日期的详细信息
const selectedInfo = computed(() => {
  const d = selected.value
  const lunar = getLunarDate(d.year(), d.month() + 1, d.date())

  return {
    date: d.format('YYYY年M月D日'),
    weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()],
    lunar: lunar,
    week: d.isoWeek(),
    dayOfYear: d.dayOfYear()
  }
})

// 切换年月
function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}

function selectDay(day: Dayjs) {
  selected.value = day
}

function isToday(day: Dayjs) {
  return day.isSame(dayjs(), 'day')
}

function isSelected(day: Dayjs) {
  return day.isSame(selected.value, 'day')
}

function isCurrentMonth(day: Dayjs) {
  return day.month() === currentMonth.value
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
        @click.self="closeDialog"
      >
        <div class="glass-dialog w-full max-w-4xl max-h-[90vh] rounded-[20px] overflow-hidden flex flex-col pt-[48px]">
          <!-- 统一的头部 -->
          <DialogTitleBar title="日历" fixed @close="closeDialog" />

          <!-- 内容区域 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid grid-cols-3 gap-6">
              <!-- 左侧：日历网格 -->
              <div class="col-span-2">
                <!-- 年月选择器 -->
                <div class="flex items-center justify-between mb-4">
                  <button
                    @click="prevMonth"
                    class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="mdi:chevron-left" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span class="text-lg font-semibold text-gray-800 dark:text-white">
                    {{ currentYear }}年{{ currentMonth + 1 }}月
                  </span>
                  <button
                    @click="nextMonth"
                    class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="mdi:chevron-right" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <!-- 星期标题 -->
                <div class="grid grid-cols-7 gap-2 mb-2">
                  <div
                    v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
                    :key="day"
                    class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                  >
                    {{ day }}
                  </div>
                </div>

                <!-- 日期网格 -->
                <div class="grid grid-cols-7 gap-2">
                  <button
                    v-for="day in calendarDays"
                    :key="day.format('YYYY-MM-DD')"
                    @click="selectDay(day)"
                    class="aspect-square flex items-center justify-center rounded-lg text-sm transition-all"
                    :class="{
                      'bg-orange-500 text-white font-semibold': isSelected(day),
                      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium': isToday(day) && !isSelected(day),
                      'text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5': isCurrentMonth(day) && !isToday(day) && !isSelected(day),
                      'text-gray-400 dark:text-gray-600': !isCurrentMonth(day)
                    }"
                  >
                    {{ day.date() }}
                  </button>
                </div>
              </div>

              <!-- 右侧：选中日期详情 -->
              <div class="space-y-4">
                <div class="glass-card p-4 space-y-3">
                  <div class="text-center">
                    <div class="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                      {{ selected.date() }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ selectedInfo.date }}
                    </div>
                  </div>

                  <div class="space-y-2 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600 dark:text-gray-400">星期</span>
                      <span class="text-gray-800 dark:text-white font-medium">{{ selectedInfo.weekday }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600 dark:text-gray-400">农历</span>
                      <span class="text-gray-800 dark:text-white font-medium">{{ selectedInfo.lunar }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600 dark:text-gray-400">第几周</span>
                      <span class="text-gray-800 dark:text-white font-medium">第 {{ selectedInfo.week }} 周</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600 dark:text-gray-400">第几天</span>
                      <span class="text-gray-800 dark:text-white font-medium">第 {{ selectedInfo.dayOfYear }} 天</span>
                    </div>
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


