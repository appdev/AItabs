<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Icon } from '@iconify/vue'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import WeatherWidget from '@/components/widgets/WeatherWidget.vue'
import CalendarWidget from '@/components/widgets/CalendarWidget.vue'
import HotSearchWidget from '@/components/widgets/HotSearchWidget.vue'
import CountdownWidget from '@/components/widgets/CountdownWidget.vue'
import MemoWidget from '@/components/widgets/MemoWidget.vue'
import MovieWidget from '@/components/widgets/MovieWidget.vue'
import AnniversaryWidget from '@/components/widgets/AnniversaryWidget.vue'
import TodoWidget from '@/components/widgets/TodoWidget.vue'
import IconItem from '@/components/icons/IconItem.vue'
import IconFolder from '@/components/icons/IconFolder.vue'
import { useGridLayout } from '@/composables/useGridLayout'
import { useContextMenu } from '@/composables/useContextMenu'
import { useWidgetsStore } from '@/stores/widgets'
import { useIconsStore } from '@/stores/icons'
import { useSettingsStore } from '@/stores/settings'
import { useEditMode } from '@/composables/useEditMode'
import type { IconSize } from '@/types/icon'
import type { Widget } from '@/types/widget'
import type { SiteIcon } from '@/types/icon'

const widgetsStore = useWidgetsStore()
const iconsStore = useIconsStore()
const settingsStore = useSettingsStore()
const { columnCount, gapY } = useGridLayout()
const { show: showContextMenu } = useContextMenu()
const { isEditing, setEditMode } = useEditMode()

const emit = defineEmits<{
  (e: 'add-icon'): void
}>()

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columnCount.value}, var(--icon-size))`,
  gridAutoRows: 'var(--icon-size)',
  columnGap: 'var(--icon-gap)',
  rowGap: `${gapY.value}px`,
}))

function getGridSpan(size: IconSize): { gridColumn: string; gridRow: string } {
  const [rows, cols] = size.split('x').map(Number)
  return { gridColumn: `span ${cols}`, gridRow: `span ${rows}` }
}

type GridItem = { type: 'widget'; data: Widget } | { type: 'icon'; data: SiteIcon }

const gridItems = computed(() => {
  const items: GridItem[] = []
  widgetsStore.currentWidgets.forEach(w => items.push({ type: 'widget', data: w }))
  iconsStore.currentIcons.forEach(i => items.push({ type: 'icon', data: i }))
  return items.sort((a, b) => a.data.order - b.data.order)
})

const localItems = ref<GridItem[]>([])
watch(gridItems, (val) => { localItems.value = [...val] }, { immediate: true })

function onDragEnd() {
  const newWidgets: Widget[] = []
  const newIcons: SiteIcon[] = []
  localItems.value.forEach((item, idx) => {
    if (item.type === 'widget') newWidgets.push({ ...item.data, order: idx })
    else newIcons.push({ ...item.data, order: idx })
  })
  newWidgets.forEach(w => widgetsStore.updateWidget(w.id, { order: w.order }))
  newIcons.forEach(i => iconsStore.updateIcon(i.id, { order: i.order }))
}

function handleContextMenu(e: MouseEvent, gridItem: GridItem) {
  if (isEditing.value) return
  e.preventDefault()
  e.stopPropagation()
  const type = gridItem.type === 'widget' ? 'widget' : 'icon'
  showContextMenu(e, gridItem.data.id, type)
}

function handleEmptyContextMenu(e: MouseEvent) {
  if (isEditing.value) return
  e.preventDefault()
  showContextMenu(e, '', 'grid')
}
</script>

<template>
  <div class="w-full flex justify-center" @click.self="setEditMode(false)" @contextmenu.prevent="handleEmptyContextMenu">
    <VueDraggable
      v-model="localItems"
      :style="gridStyle"
      :animation="150"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      filter=".no-drag"
      @end="onDragEnd"
    >
      <div
        v-for="item in localItems"
        :key="item.data.id"
        class="min-w-0"
        :style="getGridSpan(item.data.size)"
        @contextmenu.prevent="item.type !== 'widget' && handleContextMenu($event, item)"
      >
        <!-- Widget：WidgetWrapper 内部直接调用 useContextMenu，阻止冒泡 -->
        <WidgetWrapper
          v-if="item.type === 'widget'"
          :widget-id="item.data.id"
          :type="item.data.type"
          :size="item.data.size"
        >
          <WeatherWidget     v-if="item.data.type === 'weather'"     :widget="item.data" />
          <CalendarWidget    v-else-if="item.data.type === 'calendar'"    :widget="item.data" />
          <HotSearchWidget   v-else-if="item.data.type === 'hotSearch'"   :widget="item.data" />
          <CountdownWidget   v-else-if="item.data.type === 'countdown'"   :widget="item.data" />
          <MemoWidget        v-else-if="item.data.type === 'memo'"        :widget="item.data" />
          <MovieWidget       v-else-if="item.data.type === 'movie'"       :widget="item.data" />
          <AnniversaryWidget v-else-if="item.data.type === 'anniversary'" :widget="item.data" />
          <TodoWidget        v-else-if="item.data.type === 'todo'"        :widget="item.data" />
        </WidgetWrapper>

        <!-- 文件夹图标 -->
        <IconFolder v-else-if="item.data.type === 'folder'" :icon="item.data" />
        <!-- 普通图标 -->
        <IconItem v-else :icon="item.data" />
      </div>

      <!-- 固定的添加图标按钮 -->
      <div
        v-if="!isEditing"
        class="min-w-0 no-drag flex flex-col items-center gap-1 group cursor-pointer"
        style="grid-column: span 1; grid-row: span 1;"
        :style="{ opacity: 'var(--icon-opacity)' }"
        @click="$emit('add-icon')"
      >
        <div 
          class="flex items-center justify-center rounded-[var(--icon-radius)] bg-white/40 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md transition-colors flex-shrink-0"
          style="width: var(--icon-size); height: var(--icon-size);"
        >
          <div class="w-10 h-10 rounded-full bg-[#1890ff] flex items-center justify-center shadow-sm">
            <Icon icon="mdi:plus" class="w-6 h-6 text-white" />
          </div>
        </div>
        <span
          v-if="settingsStore.settings.icon.nameShow"
          class="truncate max-w-full text-center drop-shadow-md font-medium"
          style="color: var(--icon-name-color); font-size: var(--icon-name-size); text-shadow: 0 1px 2px rgba(0,0,0,0.5);"
        >添加图标</span>
      </div>
    </VueDraggable>
  </div>
</template>
