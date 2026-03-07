<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  title?: string
  showTitle?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="flex items-center justify-between px-6 py-3 border-b border-black/8 dark:border-white/10">
    <!-- 使用插槽或标题 -->\n    <slot name="title">
      <h2 v-if="showTitle && title" class="text-base font-medium text-gray-800 dark:text-white">
        {{ title }}
      </h2>
      <div v-else></div>
    </slot>

    <button
      @click="emit('close')"
      class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400"
      aria-label="关闭"
    >
      <Icon icon="mdi:close" class="text-xl" />
    </button>
  </div>
</template>
