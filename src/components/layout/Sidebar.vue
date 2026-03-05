<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useGroupsStore } from '@/stores/groups'
import { useSettingsStore } from '@/stores/settings'
import type { NavGroup } from '@/types/settings'

defineEmits<{
  openSettings: []
}>()

const groupsStore = useGroupsStore()
const settingsStore = useSettingsStore()

const sidebarSettings = computed(() => settingsStore.settings.sidebar)
const isRight = computed(() => sidebarSettings.value.placement === 'right')

const localGroups = ref<NavGroup[]>([])
watch(() => groupsStore.sortedGroups, (val) => { localGroups.value = [...val] }, { immediate: true })

function onGroupDragEnd() {
  groupsStore.reorderGroups([...localGroups.value])
}
</script>

<template>
  <aside
    class="fixed top-0 bottom-0 glass-sidebar flex flex-col items-center py-3 z-[2] transition-opacity duration-300"
    :class="[
      isRight ? 'right-0' : 'left-0',
      sidebarSettings.autoHide ? 'opacity-0 hover:opacity-100' : '',
    ]"
    :style="{ width: `${sidebarSettings.width}px` }"
  >
    <!-- 顶部头像 -->
    <div
      class="w-[30px] h-[30px] rounded-full bg-white/20 flex-shrink-0 mb-4"
      aria-hidden="true"
    />

    <!-- 中部分组导航（支持拖拽排序） -->
    <nav class="flex-1 overflow-y-auto min-h-0 w-full px-1.5">
      <VueDraggable
        v-model="localGroups"
        :animation="150"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        class="flex flex-col gap-1"
        @end="onGroupDragEnd"
      >
        <button
          v-for="group in localGroups"
          :key="group.id"
          type="button"
          class="relative flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors w-full"
          :class="
            groupsStore.activeGroupId === group.id
              ? 'bg-white/20 text-white font-semibold'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
          @click="groupsStore.setActiveGroup(group.id)"
        >
          <!-- 左侧激活指示条 -->
          <span
            v-if="groupsStore.activeGroupId === group.id"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-white"
          />
          <Icon :icon="group.icon" class="w-5 h-5" />
          <span class="text-[12px] leading-tight truncate max-w-full">{{ group.name }}</span>
        </button>
      </VueDraggable>
    </nav>

    <!-- 底部设置按钮 -->
    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      aria-label="设置"
      @click="$emit('openSettings')"
    >
      <Icon icon="mdi:cog-outline" class="w-5 h-5" />
    </button>
  </aside>
</template>
