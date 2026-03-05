<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useIconsStore } from '@/stores/icons'
import { useWidgetsStore } from '@/stores/widgets'
import type { IconSize } from '@/types/icon'
import type { WidgetSize } from '@/types/widget'

const { state, hide, openEditor, openSettings, openWidgetConfig } = useContextMenu()
const iconsStore = useIconsStore()
const widgetsStore = useWidgetsStore()

// icon 和 widget 统一展示 5 个尺寸选项
const ALL_SIZES = ['1x1', '1x2', '2x1', '2x2', '2x4']

const currentIcon = computed(() =>
  state.value.targetType === 'icon'
    ? iconsStore.icons.find(i => i.id === state.value.targetId)
    : null
)

const currentWidget = computed(() =>
  state.value.targetType === 'widget'
    ? widgetsStore.widgets.find(w => w.id === state.value.targetId)
    : null
)

const currentSize = computed(() => currentWidget.value?.size ?? currentIcon.value?.size)

function openInNewTab() {
  if (currentIcon.value?.url) window.open(currentIcon.value.url, '_blank')
  hide()
}

function changeSize(size: string) {
  const id = state.value.targetId
  if (!id) return
  if (state.value.targetType === 'widget') {
    widgetsStore.updateWidget(id, { size: size as WidgetSize })
  } else {
    iconsStore.updateIconSize(id, size as IconSize)
  }
  hide()
}

async function deleteItem() {
  const id = state.value.targetId
  if (!id) return
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    if (state.value.targetType === 'widget') widgetsStore.removeWidget(id)
    else iconsStore.removeIcon(id)
  } catch {
    // 用户取消，不做处理
  }
  hide()
}

// 边界检测：防止菜单超出屏幕
const menuStyle = computed(() => {
  const x = Math.min(state.value.x, window.innerWidth - 200)
  const y = Math.min(state.value.y, window.innerHeight - 260)
  return { left: `${x}px`, top: `${y}px` }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.visible"
      class="context-menu fixed z-[999] glass-menu rounded-xl overflow-hidden py-1 w-[168px]"
      :style="menuStyle"
    >
      <!-- 在新标签页打开（仅 icon） -->
      <button
        v-if="state.targetType === 'icon'"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
        @click="openInNewTab"
      >
        <Icon icon="mdi:open-in-new" class="w-4 h-4 flex-shrink-0" />
        在新标签页打开
      </button>

      <!-- 布局切换（icon / widget 统一 5 个尺寸） -->
      <div v-if="state.targetType !== 'grid'" class="px-3 py-1.5">
        <p class="text-[11px] text-white/40 mb-1.5">布局</p>
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="size in ALL_SIZES"
            :key="size"
            type="button"
            class="px-1.5 py-0.5 rounded text-[11px] transition-colors"
            :class="
              currentSize === size
                ? 'bg-white/30 text-white font-semibold'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            "
            @click="changeSize(size)"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <div v-if="state.targetType !== 'grid'" class="h-px bg-white/10 mx-2 my-1" />

      <!-- 编辑（仅 icon） -->
      <button
        v-if="state.targetType === 'icon'"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
        @click="openEditor"
      >
        <Icon icon="mdi:pencil-outline" class="w-4 h-4 flex-shrink-0" />
        编辑图标
      </button>

      <!-- 设置（仅 widget） -->
      <button
        v-if="state.targetType === 'widget'"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
        @click="openWidgetConfig"
      >
        <Icon icon="mdi:cog-outline" class="w-4 h-4 flex-shrink-0" />
        设置组件
      </button>

      <!-- 编辑主页 -->
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
        @click="openSettings"
      >
        <Icon icon="mdi:home-edit-outline" class="w-4 h-4 flex-shrink-0" />
        编辑主页
      </button>

      <!-- 删除（icon / widget） -->
      <button
        v-if="state.targetType !== 'grid'"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
        @click="deleteItem"
      >
        <Icon icon="mdi:delete-outline" class="w-4 h-4 flex-shrink-0" />
        删除
      </button>

      <!-- 空白区域右键 -->
      <div v-if="state.targetType === 'grid'" class="px-3 py-2 text-white/40 text-xs text-center">
        右键空白区域
      </div>
    </div>
  </Teleport>
</template>
