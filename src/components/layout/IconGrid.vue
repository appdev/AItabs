<script setup lang="ts">
import { computed } from 'vue'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import IconItem from '@/components/icons/IconItem.vue'
import { useWidgetsStore } from '@/stores/widgets'
import { useIconsStore } from '@/stores/icons'
import { useSettingsStore } from '@/stores/settings'
import type { IconSize } from '@/types/icon'
import type { Widget } from '@/types/widget'
import type { SiteIcon } from '@/types/icon'

const emit = defineEmits<{
  contextmenu: [payload: { type: 'widget'; item: Widget } | { type: 'icon'; item: SiteIcon } | { type: 'empty' }]
}>()

const widgetsStore = useWidgetsStore()
const iconsStore = useIconsStore()
const settingsStore = useSettingsStore()

const maxWidth = computed(() => {
  const s = settingsStore.settings.icon
  return `${s.maxWidth}${s.maxWidthUnit}`
})

function getGridSpan(size: IconSize): { gridColumn: string; gridRow: string } {
  const [rows, cols] = size.split('x').map(Number)
  return { gridColumn: `span ${cols}`, gridRow: `span ${rows}` }
}

type GridItem = { type: 'widget'; data: Widget } | { type: 'icon'; data: SiteIcon }

const gridItems = computed(() => {
  const items: GridItem[] = []
  widgetsStore.currentWidgets.forEach(w => items.push({ type: 'widget', data: w }))
  iconsStore.currentIcons.forEach(i => items.push({ type: 'icon', data: i }))
  return items.sort((a, b) => {
    const orderA = a.type === 'widget' ? a.data.order : a.data.order
    const orderB = b.type === 'widget' ? b.data.order : b.data.order
    return orderA - orderB
  })
})

function handleContextMenu(e: MouseEvent, gridItem: GridItem) {
  e.preventDefault()
  if (gridItem.type === 'widget') {
    emit('contextmenu', { type: 'widget', item: gridItem.data })
  } else {
    emit('contextmenu', { type: 'icon', item: gridItem.data })
  }
}

function handleEmptyContextMenu(e: MouseEvent) {
  e.preventDefault()
  emit('contextmenu', { type: 'empty' })
}
</script>

<template>
  <div
    class="w-full mx-auto"
    :style="{ maxWidth }"
    @contextmenu.prevent="handleEmptyContextMenu"
  >
    <div
      class="grid place-items-start"
      :style="{
        gridTemplateColumns: 'repeat(auto-fill, var(--icon-size))',
        gridAutoRows: 'var(--icon-size)',
        gap: 'var(--icon-gap)',
      }"
    >
      <div
        v-for="item in gridItems"
        :key="item.type === 'widget' ? item.data.id : item.data.id"
        class="min-w-0"
        :style="getGridSpan(item.type === 'widget' ? item.data.size : item.data.size)"
        @contextmenu.prevent="handleContextMenu($event, item)"
      >
        <WidgetWrapper v-if="item.type === 'widget'" :widget="item.data" />
        <IconItem v-else :icon="item.data" />
      </div>
    </div>
  </div>
</template>
