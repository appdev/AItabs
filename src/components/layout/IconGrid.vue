<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue'
import WeatherWidget from '@/components/widgets/WeatherWidget.vue'
import CalendarWidget from '@/components/widgets/CalendarWidget.vue'
import HotSearchWidget from '@/components/widgets/HotSearchWidget.vue'
import CountdownWidget from '@/components/widgets/CountdownWidget.vue'
import MemoWidget from '@/components/widgets/MemoWidget.vue'
import MovieWidget from '@/components/widgets/MovieWidget.vue'
import AnniversaryWidget from '@/components/widgets/AnniversaryWidget.vue'
import IconItem from '@/components/icons/IconItem.vue'
import IconFolder from '@/components/icons/IconFolder.vue'
import { useGridLayout } from '@/composables/useGridLayout'
import { useContextMenu } from '@/composables/useContextMenu'
import { useWidgetsStore } from '@/stores/widgets'
import { useIconsStore } from '@/stores/icons'
import type { IconSize } from '@/types/icon'
import type { Widget } from '@/types/widget'
import type { SiteIcon } from '@/types/icon'

const widgetsStore = useWidgetsStore()
const iconsStore = useIconsStore()
const { columnCount, gapY } = useGridLayout()
const { show: showContextMenu } = useContextMenu()

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
  e.preventDefault()
  e.stopPropagation()
  const type = gridItem.type === 'widget' ? 'widget' : 'icon'
  showContextMenu(e, gridItem.data.id, type)
}

function handleEmptyContextMenu(e: MouseEvent) {
  e.preventDefault()
  showContextMenu(e, '', 'grid')
}
</script>

<template>
  <div class="w-full flex justify-center" @contextmenu.prevent="handleEmptyContextMenu">
    <VueDraggable
      v-model="localItems"
      :style="gridStyle"
      :animation="150"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
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
        </WidgetWrapper>

        <!-- 文件夹图标 -->
        <IconFolder v-else-if="item.data.type === 'folder'" :icon="item.data" />
        <!-- 普通图标 -->
        <IconItem v-else :icon="item.data" />
      </div>
    </VueDraggable>
  </div>
</template>
