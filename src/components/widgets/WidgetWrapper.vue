<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { WidgetType, WidgetSize } from '@/types/widget'
import { useContextMenu } from '@/composables/useContextMenu'
import { useEditMode } from '@/composables/useEditMode'
import { useWidgetsStore, WIDGET_REGISTRY } from '@/stores/widgets'
import { useUndoToast } from '@/composables/useUndoToast'

const props = defineProps<{
  widgetId: string
  type: WidgetType
  size: WidgetSize
}>()

const { show } = useContextMenu()
const { isEditing } = useEditMode()
const widgetsStore = useWidgetsStore()
const { showToast } = useUndoToast()

function handleContextMenu(e: MouseEvent) {
  if (isEditing.value) return // 编辑模式下不显示右键菜单
  e.preventDefault()
  e.stopPropagation()
  show(e, props.widgetId, 'widget')
}

function handleDelete(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  
  const widgetMeta = WIDGET_REGISTRY.find(m => m.type === props.type)
  const name = widgetMeta ? widgetMeta.name : '组件'
  
  widgetsStore.removeWidget(props.widgetId)
  
  showToast(`已删除"${name}"`, () => {
    widgetsStore.restoreWidget(props.widgetId)
  })
}
</script>

<template>
  <div
    class="relative w-full h-full rounded-[var(--icon-radius)]"
    :class="{ 'edit-shake': isEditing }"
    @contextmenu.prevent.stop="handleContextMenu"
  >
    <!-- 删除按钮（X） -->
    <div
      v-if="isEditing"
      class="absolute -top-2 -right-2 z-[60] w-6 h-6 flex items-center justify-center rounded-full bg-gray-500/80 hover:bg-red-500 text-white cursor-pointer backdrop-blur-md shadow-sm transition-colors"
      @click.stop="handleDelete"
    >
      <Icon icon="mdi:close" class="w-4 h-4" />
    </div>

    <!-- 内部容器，添加一个防止在编辑模式下点击穿透的遮罩 -->
    <div class="w-full h-full rounded-[var(--icon-radius)] overflow-hidden">
      <slot />
      <!-- 编辑模式下盖一层透明遮罩，防止误触组件内部链接或操作 -->
      <div v-if="isEditing" class="absolute inset-0 z-50 cursor-pointer" @click.stop></div>
    </div>
  </div>
</template>
