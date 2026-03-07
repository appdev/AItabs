<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useWeatherDetailDialog } from '@/composables/useWeatherDetailDialog'
import { useWidgetsStore } from '@/stores/widgets'
import { useWeather } from '@/composables/useWeather'

const { visible, widgetId, closeDialog } = useWeatherDetailDialog()
const widgetsStore = useWidgetsStore()

// 获取天气数据
const widget = computed(() => widgetsStore.widgets.find(w => w.id === widgetId.value))
const cityRef = () => widget.value?.data?.config?.city || ''
const unitRef = () => widget.value?.data?.config?.unit || 'celsius'

const { city, temp, desc, high, low, aqi, weatherIcon, loading } = useWeather({ cityRef, unitRef })

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDialog()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeDialog" @keydown="handleKeydown">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeDialog" />
        <div class="relative w-full max-w-2xl glass-dialog rounded-2xl shadow-2xl overflow-hidden">
          <!-- 统一的头部 -->
          <DialogTitleBar @close="closeDialog">
            <template #title>
              <div class="flex items-center gap-2">
                <Icon :icon="weatherIcon" class="w-5 h-5" />
                <span class="text-base font-medium text-gray-800 dark:text-white">{{ city }} · {{ desc }}</span>
              </div>
            </template>
          </DialogTitleBar>

          <!-- 内容区域 -->
          <div v-if="loading" class="p-12 flex items-center justify-center">
            <Icon icon="mdi:loading" class="w-8 h-8 text-gray-500 dark:text-gray-400 animate-spin" />
          </div>
          <div v-else class="p-6 space-y-6">
            <!-- 当前天气 -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-6xl font-light text-gray-800 dark:text-gray-100">{{ temp }}°</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ desc }}</div>
              </div>
              <div class="text-right space-y-2">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">AQI</span> {{ aqi }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  最高 {{ high }}° · 最低 {{ low }}°
                </div>
              </div>
            </div>

            <!-- 提示信息 -->
            <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              详细天气预报功能开发中...
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active, .dialog-leave-active { transition: opacity 0.2s ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
.dialog-enter-active .glass-dialog, .dialog-leave-active .glass-dialog { transition: transform 0.2s ease; }
.dialog-enter-from .glass-dialog, .dialog-leave-to .glass-dialog { transform: scale(0.95); }
</style>
