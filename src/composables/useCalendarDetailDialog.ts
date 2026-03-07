import { ref } from 'vue'

const visible = ref(false)
const selectedDate = ref<Date>(new Date())

export function useCalendarDetailDialog() {
  function openDialog(date?: Date) {
    selectedDate.value = date || new Date()
    visible.value = true
  }

  function closeDialog() {
    visible.value = false
  }

  return {
    visible,
    selectedDate,
    openDialog,
    closeDialog
  }
}
