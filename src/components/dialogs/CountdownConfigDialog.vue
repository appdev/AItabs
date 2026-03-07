<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useCountdownDialog } from '@/composables/useCountdownDialog'
import { useWidgetsStore } from '@/stores/widgets'
import type { CountdownConfig } from '@/types/countdown'
import { DEFAULT_COUNTDOWN_CONFIG } from '@/types/countdown'

const { visible, widgetId, closeDialog } = useCountdownDialog()
const widgetsStore = useWidgetsStore()

// 当前编辑的配置
const editConfig = ref<CountdownConfig>(JSON.parse(JSON.stringify(DEFAULT_COUNTDOWN_CONFIG)))

// 监听 widgetId 变化，加载配置
watch(widgetId, (id) => {
  if (id) {
    const widget = widgetsStore.widgets.find(w => w.id === id)
    if (widget?.data?.config) {
      editConfig.value = JSON.parse(JSON.stringify(widget.data.config))
      // 确保 holiday 字段存在
      if (!editConfig.value.holiday) {
        editConfig.value.holiday = { name: '', date: '' }
      }
    } else {
      editConfig.value = JSON.parse(JSON.stringify(DEFAULT_COUNTDOWN_CONFIG))
    }
  }
}, { immediate: true })

// 保存配置
function saveConfig() {
  if (!widgetId.value) return

  const widget = widgetsStore.widgets.find(w => w.id === widgetId.value)
  if (widget) {
    widgetsStore.updateWidget(widgetId.value, {
      data: {
        config: editConfig.value,
      },
    })
  }

  closeDialog()
}

// ESC 关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeDialog()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeDialog"
        @keydown="handleKeydown"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeDialog" />

        <!-- 对话框 -->
        <div class="relative w-full max-w-md glass-dialog rounded-2xl shadow-2xl overflow-hidden">
          <!-- 统一的头部 -->
          <DialogTitleBar title="倒计时设置" @close="closeDialog" />

          <!-- 内容区域 -->
          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- 下班时间 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                下班时间
              </label>
              <input
                v-model="editConfig.offWorkTime"
                type="time"
                class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- 月薪 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                月薪（元）
              </label>
              <input
                v-model.number="editConfig.salary"
                type="number"
                min="0"
                step="100"
                class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- 发薪日 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                发薪日（每月几号）
              </label>
              <input
                v-model.number="editConfig.payDay"
                type="number"
                min="1"
                max="31"
                class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- 显示选项 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                显示选项
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="editConfig.display.showOffWork"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">显示下班倒计时</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="editConfig.display.showSalary"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">显示薪资倒计时</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="editConfig.display.showHoliday"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">显示假期倒计时</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="editConfig.display.showIncome"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">显示今日收入</span>
                </label>
              </div>
            </div>

            <!-- 自定义假期（可选） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                自定义假期（可选）
              </label>
              <div class="space-y-2">
                <input
                  v-model="editConfig.holiday!.name"
                  type="text"
                  placeholder="假期名称，如：春节"
                  class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  v-model="editConfig.holiday!.date"
                  type="date"
                  class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              @click="closeDialog"
            >
              取消
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
              @click="saveConfig"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .glass-dialog,
.dialog-leave-active .glass-dialog {
  transition: transform 0.2s ease;
}

.dialog-enter-from .glass-dialog,
.dialog-leave-to .glass-dialog {
  transform: scale(0.95);
}
</style>


