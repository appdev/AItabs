<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useIconsStore } from '@/stores/icons'
import { useWidgetsStore, WIDGET_REGISTRY } from '@/stores/widgets'
import { useEditMode } from '@/composables/useEditMode'
import { useUndoToast } from '@/composables/useUndoToast'
import type { IconSize } from '@/types/icon'
import type { WidgetSize } from '@/types/widget'

const { state, hide, openEditor, openSettings, openAddIcon, openWidgetConfig } = useContextMenu()
const iconsStore = useIconsStore()
const widgetsStore = useWidgetsStore()
const { setEditMode } = useEditMode()
const { showToast } = useUndoToast()

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

function deleteItem() {
  const id = state.value.targetId
  if (!id) return
  
  if (state.value.targetType === 'widget') {
    const w = widgetsStore.widgets.find(w => w.id === id)
    const meta = w ? WIDGET_REGISTRY.find(m => m.type === w.type) : null
    const name = meta ? meta.name : '组件'
    
    widgetsStore.removeWidget(id)
    showToast(`已删除"${name}"`, () => {
      widgetsStore.restoreWidget(id)
    })
  } else {
    const icon = iconsStore.icons.find(i => i.id === id)
    const name = icon ? (icon.name || '图标') : '图标'
    
    iconsStore.removeIcon(id)
    showToast(`已删除"${name}"`, () => {
      iconsStore.restoreIcon(id)
    })
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
      class="context-menu fixed z-[999] glass-menu rounded-xl overflow-hidden py-1 w-[140px]"
      :style="menuStyle"
    >
      <!-- 在新标签页打开（仅 icon） -->
      <button
        v-if="state.targetType === 'icon'"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
        @click="openInNewTab"
      >
        <span>在新标签页打开</span>
        <Icon icon="mdi:open-in-new" class="w-4 h-4 text-gray-400 dark:text-white/70 flex-shrink-0" />
      </button>

      <!-- 布局切换（icon / widget 统一 5 个尺寸） -->
      <div v-if="state.targetType !== 'grid'" class="px-3 py-1.5">
        <p class="text-[11px] text-gray-500 dark:text-white/40 mb-1.5">布局</p>
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="size in ALL_SIZES"
            :key="size"
            type="button"
            class="px-1.5 py-0.5 rounded text-[11px] transition-colors"
            :class="
              currentSize === size
                ? 'bg-black/10 text-gray-800 dark:bg-white/30 dark:text-white font-semibold'
                : 'bg-transparent text-gray-500 hover:bg-black/5 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/20'
            "
            @click="changeSize(size)"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <div v-if="state.targetType !== 'grid'" class="h-px bg-black/10 dark:bg-white/10 mx-2 my-1" />

      <!-- 编辑（仅 icon） -->
      <button
        v-if="state.targetType === 'icon'"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
        @click="openEditor"
      >
        <span>编辑图标</span>
        <Icon icon="mdi:pencil-outline" class="w-4 h-4 text-gray-400 dark:text-white/70 flex-shrink-0" />
      </button>

      <!-- 设置（仅 widget） -->
      <button
        v-if="state.targetType === 'widget'"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
        @click="openWidgetConfig"
      >
        <span>设置组件</span>
        <Icon icon="mdi:cog-outline" class="w-4 h-4 text-gray-400 dark:text-white/70 flex-shrink-0" />
      </button>

      <!-- 编辑主页 -->
      <button
        v-if="state.targetType !== 'grid'"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
        @click="() => { setEditMode(true); hide() }"
      >
        <span>编辑主页</span>
        <Icon icon="mdi:home-edit-outline" class="w-4 h-4 text-gray-400 dark:text-white/70 flex-shrink-0" />
      </button>

      <!-- 删除（icon / widget） -->
      <button
        v-if="state.targetType !== 'grid'"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/10 transition-colors"
        @click="deleteItem"
      >
        <span>删除</span>
        <Icon icon="mdi:delete-outline" class="w-4 h-4 flex-shrink-0" />
      </button>

      <!-- 空白区域右键 -->
      <template v-if="state.targetType === 'grid'">
        <!-- 添加图标 -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
          @click="openAddIcon"
        >
          <span>添加图标</span>
          <Icon icon="mdi:plus" class="w-4 h-4 text-gray-400 dark:text-white/70" />
        </button>

        <!-- 编辑主页 -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
          @click="() => { setEditMode(true); hide() }"
        >
          <span>编辑主页</span>
          <Icon icon="mdi:pencil-outline" class="w-4 h-4 text-gray-400 dark:text-white/70" />
        </button>

        <!-- 修改壁纸 -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
          @click="openSettings('wallpaper')"
        >
          <span>修改壁纸</span>
          <Icon icon="mdi:image-outline" class="w-4 h-4 text-gray-400 dark:text-white/70" />
        </button>

        <div class="h-px bg-black/10 dark:bg-white/10 mx-2 my-1" />

        <!-- 设置 -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10 transition-colors"
          @click="openSettings('')"
        >
          <span>设置</span>
          <Icon icon="mdi:cog-outline" class="w-4 h-4 text-gray-400 dark:text-white/70" />
        </button>
      </template>
    </div>
  </Teleport>
</template>
