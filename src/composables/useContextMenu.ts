import { ref, onMounted, onUnmounted } from 'vue'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetId: string
  targetType: 'icon' | 'widget' | 'grid'
}

const state = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  targetId: '',
  targetType: 'grid',
})

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

  return { state, show, hide }
}
