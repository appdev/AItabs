<script setup lang="ts">
import { ref } from 'vue'
import type { SiteIcon } from '@/types/icon'
import FolderDialog from '@/components/dialogs/FolderDialog.vue'

defineProps<{
  icon: SiteIcon
}>()

const showDialog = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)

function handleClick() {
  showDialog.value = !showDialog.value
}
</script>

<template>
  <button
    ref="triggerRef"
    type="button"
    class="flex flex-col items-center gap-1 w-full min-w-0 group"
    :style="{ opacity: 'var(--icon-opacity)' }"
    @click="handleClick"
  >
    <!-- 文件夹容器：毛玻璃背景 + 2x2 子图标预览 -->
    <div
      class="glass-folder flex items-center justify-center rounded-[var(--icon-radius)] overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105"
      :style="{ width: 'var(--icon-size)', height: 'var(--icon-size)' }"
    >
      <div class="grid grid-cols-2 gap-0.5 p-1.5 w-full h-full">
        <div
          v-for="child in (icon.children ?? []).slice(0, 4)"
          :key="child.id"
          class="rounded-sm overflow-hidden flex items-center justify-center"
          :style="{ backgroundColor: child.bgColor }"
        >
          <img
            v-if="child.icon"
            :src="child.icon"
            :alt="child.name"
            class="w-full h-full object-contain p-0.5"
          />
          <span v-else class="text-white font-bold truncate max-w-full px-0.5" :style="{ fontSize: (child.iconText || child.name).length > 2 ? '4px' : '6px' }">
            {{ child.iconText || child.name || '?' }}
          </span>
        </div>
        <!-- 空格占位 -->
        <div
          v-for="i in Math.max(0, 4 - (icon.children?.length ?? 0))"
          :key="`empty-${i}`"
          class="rounded-sm bg-white/10"
        />
      </div>
    </div>
    <span
      class="truncate max-w-full text-center"
      :style="{ color: 'var(--icon-name-color)', fontSize: 'var(--icon-name-size)' }"
    >
      {{ icon.name }}
    </span>
  </button>

  <FolderDialog v-model:visible="showDialog" :icon="icon" :trigger="triggerRef" />
</template>
