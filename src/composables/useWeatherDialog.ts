import { ref } from 'vue'

const visible = ref(false)
const widgetId = ref('')

export function useWeatherDialog() {
  function openDialog(id: string) {
    widgetId.value = id
    visible.value = true
  }

  function closeDialog() {
    visible.value = false
    widgetId.value = ''
  }

  return {
    visible,
    widgetId,
    openDialog,
    closeDialog,
  }
}
