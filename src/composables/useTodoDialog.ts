import { ref } from 'vue'

const visible = ref(false)

export function useTodoDialog() {
  function openDialog() {
    visible.value = true
  }

  function closeDialog() {
    visible.value = false
  }

  return {
    visible,
    openDialog,
    closeDialog,
  }
}
