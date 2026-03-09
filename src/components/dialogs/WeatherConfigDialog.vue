<script setup lang="ts">
import { ref, watch } from 'vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useWeatherDialog } from '@/composables/useWeatherDialog'
import { useWidgetsStore } from '@/stores/widgets'
import type { WeatherConfig } from '@/types/weather'
import { DEFAULT_WEATHER_CONFIG } from '@/types/weather'

const { visible, widgetId, closeDialog } = useWeatherDialog()
const widgetsStore = useWidgetsStore()

const editConfig = ref<WeatherConfig>(JSON.parse(JSON.stringify(DEFAULT_WEATHER_CONFIG)))

watch(widgetId, (id) => {
  if (id) {
    const widget = widgetsStore.widgets.find(w => w.id === id)
    if (widget?.config) {
      editConfig.value = JSON.parse(JSON.stringify(widget.config))
    } else {
      editConfig.value = JSON.parse(JSON.stringify(DEFAULT_WEATHER_CONFIG))
    }
  }
}, { immediate: true })

function saveConfig() {
  if (!widgetId.value) return
  const widget = widgetsStore.widgets.find(w => w.id === widgetId.value)
  if (widget) {
    widgetsStore.updateWidget(widgetId.value, {
      config: editConfig.value,
    })
  }
  closeDialog()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDialog()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeDialog" @keydown="handleKeydown">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeDialog" />
        <div class="relative w-full max-w-md glass-dialog rounded-[20px] shadow-2xl overflow-hidden pt-[48px]">
          <!-- 统一的头部 -->
          <DialogTitleBar title="天气设置" fixed @close="closeDialog" />
          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">城市（留空则自动定位）</label>
              <input v-model="editConfig.city" type="text" placeholder="例如：北京、Shanghai" class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">温度单位</label>
              <div class="flex gap-2">
                <button type="button" class="flex-1 py-2 rounded-lg text-sm transition-colors" :class="editConfig.unit === 'celsius' ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-black/30'" @click="editConfig.unit = 'celsius'">摄氏度 °C</button>
                <button type="button" class="flex-1 py-2 rounded-lg text-sm transition-colors" :class="editConfig.unit === 'fahrenheit' ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-black/30'" @click="editConfig.unit = 'fahrenheit'">华氏度 °F</button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" @click="closeDialog">取消</button>
            <button class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors" @click="saveConfig">保存</button>
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
