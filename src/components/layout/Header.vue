<script setup lang="ts">
import { computed } from 'vue'
import { useClock } from '@/composables/useClock'
import { useSettingsStore } from '@/stores/settings'

const { hours, minutes, seconds, dateStr, weekStr, lunarStr } = useClock()
const settingsStore = useSettingsStore()

const t = computed(() => settingsStore.settings.time)

// 支持 12/24 小时制
const displayHours = computed(() => {
  if (!t.value.hour24) {
    const h = Number(hours.value) % 12 || 12
    return String(h).padStart(2, '0')
  }
  return hours.value
})

const dateLine = computed(() => {
  const parts: string[] = []
  if (t.value.month) parts.push(dateStr.value)
  if (t.value.week) parts.push(weekStr.value)
  if (t.value.lunar) parts.push(lunarStr.value)
  return parts.join(' · ')
})
</script>

<template>
  <header
    v-if="t.show"
    class="flex flex-col items-center gap-1 py-4"
  >
    <div
      class="flex items-baseline gap-0"
      :style="{
        fontSize: 'var(--time-size)',
        color: 'var(--time-color)',
        fontWeight: 'var(--time-font-weight)',
        fontFamily: 'var(--time-font)',
      }"
    >
      <span>{{ displayHours }}</span>
      <span class="animate-pulse" aria-hidden="true">:</span>
      <span>{{ minutes }}</span>
      <template v-if="t.sec">
        <span class="animate-pulse" aria-hidden="true">:</span>
        <span>{{ seconds }}</span>
      </template>
    </div>
    <p
      v-if="dateLine"
      class="text-sm opacity-90"
      :style="{ color: 'var(--time-color)' }"
    >
      {{ dateLine }}
    </p>
  </header>
</template>
