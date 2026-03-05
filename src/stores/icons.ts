import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SiteIcon, IconSize } from '@/types/icon'
import { generateId } from '@/utils/id'
import { useGroupsStore } from './groups'

const DEFAULT_ICONS: SiteIcon[] = [
  { id: 'def_1', name: '百度', url: 'https://www.baidu.com', icon: 'https://files.codelife.cc/icons/baidu.svg', bgColor: '#346efd', size: '1x1', type: 'site', order: 100, groupId: '1' },
  { id: 'def_2', name: '淘宝', url: 'https://www.taobao.com', icon: 'https://files.codelife.cc/icons/taobao.svg', bgColor: '#f52324', size: '1x1', type: 'site', order: 101, groupId: '1' },
  { id: 'def_3', name: '京东', url: 'https://www.jd.com', icon: 'https://files.codelife.cc/icons/jd.svg', bgColor: '#ff0000', size: '1x1', type: 'site', order: 102, groupId: '1' },
  { id: 'def_4', name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://files.codelife.cc/icons/bilibili.svg', bgColor: '#01affd', size: '1x1', type: 'site', order: 103, groupId: '1' },
  { id: 'def_5', name: '知乎', url: 'https://www.zhihu.com', icon: 'https://files.codelife.cc/icons/zhihu.svg', bgColor: '#0066ff', size: '1x1', type: 'site', order: 104, groupId: '1' },
  { id: 'def_6', name: 'GitHub', url: 'https://github.com', icon: 'https://files.codelife.cc/icons/github.svg', bgColor: '#333333', size: '1x1', type: 'site', order: 105, groupId: '1' },
  { id: 'def_7', name: '掘金', url: 'https://juejin.cn', icon: 'https://files.codelife.cc/icons/juejin.svg', bgColor: '#0984fe', size: '1x1', type: 'site', order: 106, groupId: '1' },
  { id: 'def_8', name: '微博', url: 'https://weibo.com', icon: 'https://files.codelife.cc/icons/weibo.svg', bgColor: '#e6162d', size: '1x1', type: 'site', order: 107, groupId: '1' },
  { id: 'def_9', name: '豆瓣', url: 'https://www.douban.com', icon: 'https://files.codelife.cc/icons/douban.svg', bgColor: '#00b51d', size: '1x1', type: 'site', order: 108, groupId: '1' },
  { id: 'def_10', name: '天猫', url: 'https://www.tmall.com', icon: 'https://files.codelife.cc/icons/tmall.svg', bgColor: '#ff0030', size: '1x1', type: 'site', order: 109, groupId: '1' },
]

export const useIconsStore = defineStore('icons', () => {
  const icons = ref<SiteIcon[]>(structuredClone(DEFAULT_ICONS))

  const currentIcons = computed(() => {
    const groupsStore = useGroupsStore()
    return icons.value
      .filter(i => i.groupId === groupsStore.activeGroupId)
      .sort((a, b) => a.order - b.order)
  })

  function addIcon(icon: Partial<SiteIcon> & { name: string; url: string }) {
    const groupsStore = useGroupsStore()
    const maxOrder = Math.max(0, ...icons.value.map(i => i.order))
    icons.value.push({
      id: generateId(),
      icon: '',
      bgColor: '#0984fe',
      size: '1x1',
      type: 'site',
      groupId: groupsStore.activeGroupId,
      order: maxOrder + 1,
      ...icon,
    })
  }

  function removeIcon(id: string) {
    icons.value = icons.value.filter(i => i.id !== id)
  }

  function updateIcon(id: string, updates: Partial<SiteIcon>) {
    const icon = icons.value.find(i => i.id === id)
    if (icon) Object.assign(icon, updates)
  }

  function updateIconSize(id: string, size: IconSize) {
    updateIcon(id, { size })
  }

  function reorderIcons(newIcons: SiteIcon[]) {
    const otherIcons = icons.value.filter(
      i => !newIcons.find(n => n.id === i.id)
    )
    icons.value = [
      ...otherIcons,
      ...newIcons.map((icon, idx) => ({ ...icon, order: idx })),
    ]
  }

  return { icons, currentIcons, addIcon, removeIcon, updateIcon, updateIconSize, reorderIcons }
}, {
  persist: {
    key: 'aitabs-icons',
  },
})
