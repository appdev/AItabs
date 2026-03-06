import { ref } from 'vue'

interface UndoAction {
  message: string
  onUndo: () => void
}

const isVisible = ref(false)
const currentAction = ref<UndoAction | null>(null)
let timeoutId: number | null = null

export function useUndoToast() {
  function showToast(message: string, onUndo: () => void, duration = 2500) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    currentAction.value = { message, onUndo }
    isVisible.value = true
    
    timeoutId = window.setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  function handleUndo() {
    if (currentAction.value) {
      currentAction.value.onUndo()
      isVisible.value = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      currentAction.value = null
    }
  }

  return { isVisible, currentAction, showToast, handleUndo }
}
