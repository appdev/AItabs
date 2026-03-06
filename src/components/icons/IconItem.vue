<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import { useEditMode } from '@/composables/useEditMode'
import { useIconsStore } from '@/stores/icons'
import { useUndoToast } from '@/composables/useUndoToast'
import type { SiteIcon } from '@/types/icon'

const props = defineProps<{
  icon: SiteIcon
}>()

const settingsStore = useSettingsStore()
const iconsStore = useIconsStore()
const { isEditing } = useEditMode()
const { showToast } = useUndoToast()

const openInNewTab = computed(
  () => props.icon.openInNewTab ?? settingsStore.settings.open.iconBlank
)

// 文字图标：优先 iconText，其次 name
const displayText = computed(() => {
  const t = props.icon.iconText?.trim()
  if (t) return t
  return props.icon.name || '?'
})

// size 格式 "行x列"，根据行列分别计算宽和高
const iconRows = computed(() => {
  const parts = props.icon.size.split('x').map(Number)
  return parts[0] || 1
})

const iconCols = computed(() => {
  const parts = props.icon.size.split('x').map(Number)
  return parts[1] || 1
})

const widthStyle = computed(() => {
  const c = iconCols.value
  if (c <= 1) return 'var(--icon-size)'
  return `calc(var(--icon-size) * ${c} + var(--icon-gap) * ${c - 1})`
})

const heightStyle = computed(() => {
  const r = iconRows.value
  if (r <= 1) return 'var(--icon-size)'
  return `calc(var(--icon-size) * ${r} + var(--icon-gap-y) * ${r - 1})`
})

const fontSizeStyle = computed(() => {
  // 取长宽较小值作为字体大小的基准
  const s = Math.min(iconRows.value, iconCols.value)
  if (s <= 1) return 'calc(var(--icon-size) * 0.4)'
  return `calc((var(--icon-size) * ${s} + var(--icon-gap) * ${s - 1}) * 0.35)`
})

function handleClick() {
  if (isEditing.value) return // 编辑模式下不触发跳转
  if (props.icon.url) {
    window.open(props.icon.url, openInNewTab.value ? '_blank' : '_self')
  }
}

function handleDelete(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  
  const name = props.icon.name || '图标'
  iconsStore.removeIcon(props.icon.id)
  
  showToast(`已删除"${name}"`, () => {
    iconsStore.restoreIcon(props.icon.id)
  })
}
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-1 w-full min-w-0 group"
    :class="{ 'edit-shake cursor-grab': isEditing }"
    :style="{ opacity: 'var(--icon-opacity)' }"
  >
    <!-- 删除按钮（X） -->
    <div
      v-if="isEditing"
      class="absolute -top-2 -right-2 z-[60] w-6 h-6 flex items-center justify-center rounded-full bg-gray-500/80 hover:bg-red-500 text-white cursor-pointer backdrop-blur-md shadow-sm transition-colors"
      @click.stop="handleDelete"
    >
      <Icon icon="mdi:close" class="w-4 h-4" />
    </div>

    <button
      type="button"
      class="flex flex-col items-center gap-1 w-full min-w-0 group cursor-pointer"
      :class="{ 'pointer-events-none': isEditing }"
      @click="handleClick"
    >
      <div
        class="flex items-center justify-center rounded-[var(--icon-radius)] overflow-hidden flex-shrink-0 transition-shadow shadow-[0_0_5px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        :class="{ 'active:scale-[0.99]': !isEditing }"
        :style="{
          width: widthStyle,
          height: heightStyle,
          backgroundColor: icon.bgColor,
        }"
      >
        <img
          v-if="icon.icon && !icon.iconText"
          :src="icon.icon"
          :alt="icon.name"
          class="w-full h-full object-cover"
        />
        <span
          v-else
          class="text-white font-bold select-none leading-none text-center px-1 overflow-hidden truncate max-w-full"
          :style="{
            fontSize: displayText.length > 2
              ? `calc(${fontSizeStyle} * 0.5)`
              : displayText.length > 1
                ? `calc(${fontSizeStyle} * 0.75)`
                : fontSizeStyle
          }"
        >{{ displayText }}</span>
      </div>
      <span
        v-if="settingsStore.settings.icon.nameShow"
        class="truncate max-w-full text-center"
        :style="{ color: 'var(--icon-name-color)', fontSize: 'var(--icon-name-size)' }"
      >
        {{ icon.name }}
      </span>
    </button>
  </div>
</template>
