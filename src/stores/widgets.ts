import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Widget, WidgetType, WidgetMeta } from '@/types/widget'
import { generateId } from '@/utils/id'
import { useGroupsStore } from './groups'

export const WIDGET_REGISTRY: WidgetMeta[] = [
  { type: 'weather', name: '天气', description: '实时天气信息', defaultSize: '2x2', icon: 'mdi:weather-partly-cloudy', category: '效率' },
  { type: 'calendar', name: '日历', description: '公历+农历日期展示', defaultSize: '2x2', icon: 'mdi:calendar', category: '效率' },
  { type: 'hotSearch', name: '热搜榜', description: '百度/微博/抖音热搜', defaultSize: '2x4', icon: 'mdi:fire', category: '效率' },
  { type: 'countdown', name: '下班倒计时', description: '下班/发薪/节日倒计时', defaultSize: '2x4', icon: 'mdi:timer-sand', category: '效率' },
  { type: 'memo', name: '备忘录', description: '快速记录备忘', defaultSize: '2x2', icon: 'mdi:note-text-outline', category: '效率' },
  { type: 'movie', name: '电影日历', description: '每天一部优秀电影', defaultSize: '2x2', icon: 'mdi:movie-open-outline', category: '娱乐' },
  { type: 'anniversary', name: '纪念日', description: '重要日期纪念', defaultSize: '2x2', icon: 'mdi:heart-outline', category: '效率' },
]

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'w_weather', type: 'weather', size: '2x2', order: 0, groupId: '1', config: {} },
  { id: 'w_calendar', type: 'calendar', size: '2x2', order: 1, groupId: '1', config: {} },
  { id: 'w_hotSearch', type: 'hotSearch', size: '2x4', order: 2, groupId: '1', config: {} },
  { id: 'w_countdown', type: 'countdown', size: '2x4', order: 3, groupId: '1', config: { offWork: '18:00', salary: 10000, payDay: 10 } },
]

export const useWidgetsStore = defineStore('widgets', () => {
  const widgets = ref<Widget[]>(structuredClone(DEFAULT_WIDGETS))

  // 过滤软删除的 widget
  const currentWidgets = computed(() => {
    const groupsStore = useGroupsStore()
    return widgets.value
      .filter(w => w.groupId === groupsStore.activeGroupId && !w.deletedAt)
      .sort((a, b) => a.order - b.order)
  })

  function addWidget(type: WidgetType, config: Record<string, any> = {}) {
    const meta = WIDGET_REGISTRY.find(m => m.type === type)
    if (!meta) return
    const groupsStore = useGroupsStore()
    const maxOrder = Math.max(0, ...widgets.value.map(w => w.order))
    widgets.value.push({
      id: generateId(),
      type,
      size: meta.defaultSize,
      order: maxOrder + 1,
      groupId: groupsStore.activeGroupId,
      config,
      updatedAt: Date.now(),
      dirty: true,
    })
  }

  function removeWidget(id: string) {
    const widget = widgets.value.find(w => w.id === id)
    if (!widget) return
    widget.deletedAt = Date.now()
    widget.updatedAt = Date.now()
    widget.dirty = true
  }

  function updateWidget(id: string, updates: Partial<Widget>) {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      Object.assign(widget, updates)
      widget.updatedAt = Date.now()
      widget.dirty = true
    }
  }

  function reorderWidgets(newWidgets: Widget[]) {
    const others = widgets.value.filter(
      w => !newWidgets.find(n => n.id === w.id)
    )
    const now = Date.now()
    widgets.value = [
      ...others,
      ...newWidgets.map((w, i) => ({ ...w, order: i, updatedAt: now, dirty: true })),
    ]
  }

  function getDirtyWidgets(): Widget[] {
    return widgets.value.filter(w => w.dirty)
  }

  function applyRemoteItem(item: { id: string; data: Record<string, unknown>; updatedAt: number }) {
    const idx = widgets.value.findIndex(w => w.id === item.id)
    if (idx !== -1) {
      widgets.value[idx] = { ...widgets.value[idx]!, ...(item.data as unknown as Partial<Widget>), updatedAt: item.updatedAt, dirty: false }
    }
  }

  function applyRemoteChanges(items: { id: string; data: Record<string, unknown>; updatedAt: number; deletedAt?: number | null }[]) {
    for (const item of items) {
      const idx = widgets.value.findIndex(w => w.id === item.id)
      const remote = { ...(item.data as unknown as Widget), updatedAt: item.updatedAt, deletedAt: item.deletedAt ?? null, dirty: false }

      if (item.deletedAt) {
        if (idx !== -1) widgets.value.splice(idx, 1)
        continue
      }

      if (idx === -1) {
        widgets.value.push(remote)
      } else if (item.updatedAt > (widgets.value[idx]!.updatedAt ?? 0)) {
        widgets.value[idx] = remote
      }
    }
  }

  function clearDirty() {
    widgets.value = widgets.value
      .filter(w => !w.deletedAt)
      .map(w => ({ ...w, dirty: false }))
  }

  function resetWidgets() {
    widgets.value = structuredClone(DEFAULT_WIDGETS)
  }

  return {
    widgets, currentWidgets,
    addWidget, removeWidget, updateWidget, reorderWidgets, resetWidgets,
    getDirtyWidgets, applyRemoteItem, applyRemoteChanges, clearDirty,
  }
}, {
  persist: {
    key: 'aitabs-widgets',
  },
})
