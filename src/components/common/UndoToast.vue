<script setup lang="ts">
import { useUndoToast } from '@/composables/useUndoToast'

const { isVisible, currentAction, handleUndo } = useUndoToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div
        v-if="isVisible"
        class="fixed top-6 right-6 z-[1000] flex items-center gap-4 px-4 py-2.5 rounded-xl shadow-lg bg-[#1e1e20] border border-white/5"
      >
        <span class="text-[13px] text-white/90">
          {{ currentAction?.message }}
        </span>
        <button
          type="button"
          class="text-[13px] text-blue-500 hover:text-blue-400 font-medium cursor-pointer transition-colors"
          @click="handleUndo"
        >
          撤销
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
