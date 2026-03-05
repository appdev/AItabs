<script setup lang="ts">
import type { Widget } from '@/types/widget'
import CountdownWidget from './CountdownWidget.vue'

defineProps<{
  widget: Widget
}>()

// 其余 widget 组件（WeatherWidget/CalendarWidget 等）由 T16-T20 实现后在此注册
</script>

<template>
  <div class="w-full h-full rounded-[var(--icon-radius)] overflow-hidden">
    <CountdownWidget v-if="widget.type === 'countdown'" :widget="widget" />
    <!-- 未实现的组件显示占位，T16-T20 完成后补充各 v-else-if 分支 -->
    <div v-else class="w-full h-full glass-card flex items-center justify-center">
      <span class="text-xs text-gray-400">{{ widget.type }}</span>
    </div>
  </div>
</template>
