import { ref, onMounted, onUnmounted } from 'vue'
import { useWidgetsStore } from '@/stores/widgets'
import { useTodoDialog } from './useTodoDialog'
import { useMemoDialog } from './useMemoDialog'
import { useCountdownDialog } from './useCountdownDialog'
import { useAnniversaryDialog } from './useAnniversaryDialog'
import { useWeatherDialog } from './useWeatherDialog'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetId: string
  targetType: 'icon' | 'widget' | 'grid'
}

// 模块级单例，所有调用方共享同一份状态
const state = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  targetId: '',
  targetType: 'grid',
})

const showIconEditor = ref(false)
const editingIconId = ref('')
const showSettingsFromMenu = ref(false)
const showAddIconFromMenu = ref(false)
const activeSettingsMenu = ref<string>('') // 用于控制打开设置时的默认激活面板
// 编辑图标：复用 AddDialog（custom tab）
const showEditIcon = ref(false)
const editIconId = ref('')

export function useContextMenu() {
  function show(e: MouseEvent, targetId: string, targetType: 'icon' | 'widget' | 'grid' = 'icon') {
    e.preventDefault()
    e.stopPropagation()
    state.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetId,
      targetType,
    }
  }

  function hide() {
    state.value.visible = false
  }

  function openEditor() {
    editingIconId.value = state.value.targetId
    editIconId.value = state.value.targetId
    hide()
    showIconEditor.value = true
    showEditIcon.value = true
  }

  function openSettings(activeMenu = '') {
    hide()
    activeSettingsMenu.value = activeMenu
    showSettingsFromMenu.value = true
  }
  
  function openAddIcon() {
    hide()
    showAddIconFromMenu.value = true
  }

  function openWidgetConfig() {
    const widgetId = state.value.targetId
    if (!widgetId) return

    // 获取 widget 类型
    const widgetsStore = useWidgetsStore()
    const widget = widgetsStore.widgets.find(w => w.id === widgetId)
    if (!widget) return

    hide()

    // 根据 widget 类型打开对应的专用对话框
    switch (widget.type) {
      case 'todo':
        useTodoDialog().openDialog()
        break
      case 'memo':
        useMemoDialog().openDialog(widgetId)
        break
      case 'countdown':
        useCountdownDialog().openDialog(widgetId)
        break
      case 'anniversary':
        useAnniversaryDialog().openDialog(widgetId)
        break
      case 'weather':
        useWeatherDialog().openDialog(widgetId)
        break
      default:
        // 其他类型暂无配置对话框
        console.log(`Widget type "${widget.type}" has no config dialog yet`)
        break
    }
  }

  function onClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.context-menu')) {
      hide()
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') hide()
  }

  onMounted(() => {
    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onKeydown)
  })

  return { state, show, hide, openEditor, openSettings, openAddIcon, openWidgetConfig, showIconEditor, editingIconId, showSettingsFromMenu, activeSettingsMenu, showAddIconFromMenu, showEditIcon, editIconId }
}
