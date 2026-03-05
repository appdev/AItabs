import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NavGroup } from '@/types/settings'
import { generateId } from '@/utils/id'

const DEFAULT_GROUPS: NavGroup[] = [
  { id: '1', name: '主页', icon: 'mdi:home-outline', order: 0 },
  { id: '2', name: '编程', icon: 'mdi:code-tags', order: 1 },
  { id: '3', name: '设计', icon: 'mdi:palette-outline', order: 2 },
  { id: '4', name: '产品', icon: 'mdi:lightbulb-outline', order: 3 },
  { id: '5', name: 'AI', icon: 'mdi:robot-outline', order: 4 },
  { id: '6', name: '摸鱼', icon: 'mdi:fish', order: 5 },
]

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<NavGroup[]>(structuredClone(DEFAULT_GROUPS))
  const activeGroupId = ref('1')

  // 过滤软删除的分组
  const sortedGroups = computed(() =>
    [...groups.value]
      .filter(g => !g.deletedAt)
      .sort((a, b) => a.order - b.order)
  )

  function setActiveGroup(id: string) {
    activeGroupId.value = id
  }

  function addGroup(name: string, icon: string) {
    groups.value.push({
      id: generateId(),
      name,
      icon,
      order: groups.value.length,
      updatedAt: Date.now(),
      dirty: true,
    })
  }

  function removeGroup(id: string) {
    const group = groups.value.find(g => g.id === id)
    if (!group) return
    group.deletedAt = Date.now()
    group.updatedAt = Date.now()
    group.dirty = true
  }

  function reorderGroups(newGroups: NavGroup[]) {
    const now = Date.now()
    groups.value = newGroups.map((g, i) => ({ ...g, order: i, updatedAt: now, dirty: true }))
  }

  function getDirtyGroups(): NavGroup[] {
    return groups.value.filter(g => g.dirty)
  }

  function applyRemoteItem(item: { id: string; data: Record<string, unknown>; updatedAt: number }) {
    const idx = groups.value.findIndex(g => g.id === item.id)
    if (idx !== -1) {
      groups.value[idx] = { ...groups.value[idx]!, ...(item.data as unknown as Partial<NavGroup>), updatedAt: item.updatedAt, dirty: false }
    }
  }

  function applyRemoteChanges(items: { id: string; data: Record<string, unknown>; updatedAt: number; deletedAt?: number | null }[]) {
    for (const item of items) {
      const idx = groups.value.findIndex(g => g.id === item.id)
      const remote = { ...(item.data as unknown as NavGroup), updatedAt: item.updatedAt, deletedAt: item.deletedAt ?? null, dirty: false }

      if (item.deletedAt) {
        if (idx !== -1) groups.value.splice(idx, 1)
        continue
      }

      if (idx === -1) {
        groups.value.push(remote)
      } else if (item.updatedAt > (groups.value[idx]!.updatedAt ?? 0)) {
        groups.value[idx] = remote
      }
    }
  }

  function clearDirty() {
    groups.value = groups.value
      .filter(g => !g.deletedAt)
      .map(g => ({ ...g, dirty: false }))
  }

  function resetGroups() {
    groups.value = structuredClone(DEFAULT_GROUPS)
    activeGroupId.value = '1'
  }

  return {
    groups, activeGroupId, sortedGroups,
    setActiveGroup, addGroup, removeGroup, reorderGroups, resetGroups,
    getDirtyGroups, applyRemoteItem, applyRemoteChanges, clearDirty,
  }
}, {
  persist: {
    key: 'aitabs-groups',
  },
})
