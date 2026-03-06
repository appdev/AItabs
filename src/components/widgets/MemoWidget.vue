<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetsStore } from '@/stores/widgets'
import type { Widget } from '@/types/widget'

const props = defineProps<{ widget: Widget }>()

const widgetsStore = useWidgetsStore()

const content = computed({
  get: () => (props.widget.config.content as string) ?? '',
  set: (val: string) => saveDebounced(val),
})

let saveTimer: ReturnType<typeof setTimeout> | null = null
function saveDebounced(val: string) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    widgetsStore.updateWidget(props.widget.id, {
      config: { ...props.widget.config, content: val },
    })
  }, 500)
}
</script>

<template>
  <div class="w-full h-full glass-card flex flex-col overflow-hidden">
    <!-- 标题栏：黄色渐变 -->
    <div class="bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 px-3 py-1.5 flex-shrink-0">
      <span class="text-white text-xs font-medium">备忘录</span>
    </div>

    <!-- 编辑区：自适应文字，透明背景 -->
    <textarea
      v-model="content"
      class="flex-1 w-full resize-none bg-transparent text-gray-800 dark:text-white text-xs leading-relaxed p-2 outline-none placeholder-gray-400 dark:placeholder-gray-500"
      placeholder="点击输入备忘内容..."
      spellcheck="false"
    />
  </div>
</template>
