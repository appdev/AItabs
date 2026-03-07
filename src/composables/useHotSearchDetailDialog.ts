import { ref } from 'vue'

const visible = ref(false)
const currentSource = ref<'baidu' | 'weibo' | 'douyin'>('baidu')

export function useHotSearchDetailDialog() {
  function openDialog(source?: 'baidu' | 'weibo' | 'douyin') {
    currentSource.value = source || 'baidu'
    visible.value = true
  }

  function closeDialog() {
    visible.value = false
  }

  return {
    visible,
    currentSource,
    openDialog,
    closeDialog
  }
}
