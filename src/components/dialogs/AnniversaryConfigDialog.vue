<script setup lang="ts">
import { ref, watch } from 'vue'
import DialogTitleBar from '@/components/common/DialogTitleBar.vue'
import { useAnniversaryDialog } from '@/composables/useAnniversaryDialog'
import { useWidgetsStore } from '@/stores/widgets'
import type { AnniversaryConfig } from '@/types/anniversary'
import { DEFAULT_ANNIVERSARY_CONFIG } from '@/types/anniversary'

const { visible, widgetId, closeDialog } = useAnniversaryDialog()
const widgetsStore = useWidgetsStore()

// 当前编辑的配置
const editConfig = ref<AnniversaryConfig>(JSON.parse(JSON.stringify(DEFAULT_ANNIVERSARY_CONFIG)))

// 监听 widgetId 变化，加载配置
watch(widgetId, (id) => {
  if (id) {
    const widget = widgetsStore.widgets.find(w => w.id === id)
    if (widget?.config) {
      editConfig.value = JSON.parse(JSON.stringify(widget.config))
    } else {
      editConfig.value = JSON.parse(JSON.stringify(DEFAULT_ANNIVERSARY_CONFIG))
    }
  }
}, { immediate: true })

// 保存配置
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
        <div class="relative w-full max-w-md glass-dialog rounded-[20px] shadow-2xl overflow-hidden pt-[48px]">
          <!-- 统一的头部 -->
          <DialogTitleBar title="纪念日设置" fixed @close="closeDialog" />

          <!-- 内容区域 -->
          <div class="p-6 space-y-6">
            <!-- 标题 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标题文字
              </label>
              <input
                v-model="editConfig.title"
                type="text"
                placeholder="例如：你在世界已经"
                class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- 起始日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                起始日期
              </label>
              <input
                v-model="editConfig.startDate"
                type="date"
                class="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                将计算从该日期到今天的天数
              </p>
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
