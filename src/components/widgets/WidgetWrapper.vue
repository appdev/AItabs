<script setup lang="ts">
import type { WidgetType, WidgetSize } from '@/types/widget'
import { useContextMenu } from '@/composables/useContextMenu'

const props = defineProps<{
  widgetId: string
  type: WidgetType
  size: WidgetSize
}>()

const { show } = useContextMenu()

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  show(e, props.widgetId, 'widget')
}
</script>

<template>
  <div
    class="w-full h-full rounded-[var(--icon-radius)] overflow-hidden"
    @contextmenu.prevent.stop="handleContextMenu"
  >
    <slot />
  </div>
</template>
