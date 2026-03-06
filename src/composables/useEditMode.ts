import { ref } from 'vue'

const isEditing = ref(false)

export function useEditMode() {
  function toggleEditMode() {
    isEditing.value = !isEditing.value
  }
  function setEditMode(value: boolean) {
    isEditing.value = value
  }
  return { isEditing, toggleEditMode, setEditMode }
}
