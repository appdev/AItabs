<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  title?: string
  showDefaultClose?: boolean
  fixed?: boolean
}>(), {
  showDefaultClose: true,
  fixed: false
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="dialog-title-bar flex items-center justify-between z-10 border-b border-black/8 dark:border-white/10"
    :class="fixed ? 'absolute top-0 left-0 right-0 h-12 px-4' : 'h-12 px-6'"
  >
    <!-- 标题区域 - 支持插槽或直接传入标题 -->
    <slot name="title">
      <h2 v-if="title" class="font-bold text-gray-800 dark:text-white text-sm">
        {{ title }}
      </h2>
      <div v-else />
    </slot>

    <!-- 右侧操作区 -->
    <div class="flex items-center gap-2">
      <slot name="actions" />

      <!-- 关闭按钮插槽，如果没有提供则使用默认按钮 -->
      <slot name="close">
        <button
          v-if="showDefaultClose"
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400"
          @click="emit('close')"
        >
          <Icon icon="mdi:close" class="text-xl" />
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.dialog-title-bar {
  background: transparent;
}
</style>
