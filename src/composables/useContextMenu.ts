import { ref, onMounted, onUnmounted } from 'vue'

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
// 编辑图标：复用 AddDialog（custom tab）
const showEditIcon = ref(false)
const editIconId = ref('')
const showWidgetConfig = ref(false)
const configuringWidgetId = ref('')

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

  function openSettings() {
    hide()
    showSettingsFromMenu.value = true
  }

  function openWidgetConfig() {
    configuringWidgetId.value = state.value.targetId
    hide()
    showWidgetConfig.value = true
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

  return { state, show, hide, openEditor, openSettings, openWidgetConfig, showIconEditor, editingIconId, showSettingsFromMenu, showWidgetConfig, configuringWidgetId, showEditIcon, editIconId }
}
