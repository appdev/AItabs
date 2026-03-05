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

  const sortedGroups = computed(() =>
    [...groups.value].sort((a, b) => a.order - b.order)
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
    })
  }

  function removeGroup(id: string) {
    groups.value = groups.value.filter(g => g.id !== id)
  }

  function reorderGroups(newGroups: NavGroup[]) {
    groups.value = newGroups.map((g, i) => ({ ...g, order: i }))
  }

  return { groups, activeGroupId, sortedGroups, setActiveGroup, addGroup, removeGroup, reorderGroups }
}, {
  persist: {
    key: 'aitabs-groups',
  },
})
