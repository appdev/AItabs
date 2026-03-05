import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useGridLayout() {
  const settingsStore = useSettingsStore()
  const windowWidth = ref(window.innerWidth)

  function onResize() {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  // 实际容器宽度（取窗口宽度和 maxWidth 设置中的较小值）
  const containerWidth = computed(() => {
    const s = settingsStore.settings.icon
    const maxW = s.maxWidthUnit === '%'
      ? (windowWidth.value * s.maxWidth) / 100
      : s.maxWidth
    return Math.min(windowWidth.value, maxW)
  })

  // 每行列数（向下取整）
  const columnCount = computed(() => {
    const s = settingsStore.settings.icon
    return Math.max(1, Math.floor(containerWidth.value / (s.iconSize + s.gapX)))
  })

  return { windowWidth, containerWidth, columnCount }
}
