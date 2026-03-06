<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useWeather } from '@/composables/useWeather'
import type { Widget } from '@/types/widget'

const props = defineProps<{ widget: Widget }>()

const cityRef = () => (props.widget.config.city as string) ?? ''
const unitRef = () => (props.widget.config.unit as 'celsius' | 'fahrenheit') ?? 'celsius'
const unit = computed(() => unitRef())

const { city, temp, desc, high, low, aqi, weatherIcon, loading, error, refresh } = useWeather({ cityRef, unitRef })

const unitSymbol = computed(() => unit.value === 'fahrenheit' ? '°F' : '°')

// AQI 等级颜色
const aqiColor = computed(() => {
  const n = parseInt(aqi.value)
  if (isNaN(n)) return 'bg-gray-400/60'
  if (n <= 50)  return 'bg-green-400/80'
  if (n <= 100) return 'bg-yellow-400/80'
  if (n <= 150) return 'bg-orange-400/80'
  if (n <= 200) return 'bg-red-400/80'
  return 'bg-purple-500/80'
})
</script>

<template>
  <div class="w-full h-full glass-card p-3 flex flex-col select-none text-gray-800 dark:text-white">

    <!-- 加载中 -->
    <template v-if="loading">
      <div class="flex-1 flex items-center justify-center">
        <Icon icon="mdi:loading" class="w-6 h-6 text-gray-500 dark:text-gray-400 animate-spin" />
      </div>
    </template>

    <!-- 获取失败 -->
    <template v-else-if="error">
      <div class="flex-1 flex flex-col items-center justify-center gap-1.5">
        <Icon icon="mdi:weather-cloudy-alert" class="w-7 h-7 text-gray-500 dark:text-gray-400" />
        <span class="text-gray-500 dark:text-gray-400 text-[11px]">获取天气失败</span>
        <button type="button" class="text-gray-600 dark:text-gray-300 text-[11px] underline" @click="refresh">重试</button>
      </div>
    </template>

    <!-- 正常展示 -->
    <template v-else>
      <!-- 顶部：城市 + 图标 -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-1.5 min-w-0">
          <Icon :icon="weatherIcon" class="w-5 h-5 flex-shrink-0" />
          <span class="text-xs font-medium truncate">{{ city }}</span>
        </div>
        <span class="text-gray-400 dark:text-gray-500 text-[10px] flex-shrink-0 ml-1">天气</span>
      </div>

      <!-- 中间：温度大字 -->
      <div class="flex-1 flex items-center">
        <span class="font-light leading-none" style="font-size: clamp(2rem, 4vw, 2.5rem)">
          {{ temp }}{{ unitSymbol }}
        </span>
      </div>

      <!-- 底部：AQI 标签 + 高低温 -->
      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <span
            class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-white font-medium"
            :class="aqiColor"
          >
            AQI {{ aqi }}
          </span>
          <span class="text-gray-600 dark:text-gray-300 text-[11px] truncate">{{ desc }}</span>
        </div>
        <div class="text-gray-500 dark:text-gray-400 text-[10px]">
          最高 {{ high }}{{ unitSymbol }} · 最低 {{ low }}{{ unitSymbol }}
        </div>
      </div>
    </template>

  </div>
</template>
