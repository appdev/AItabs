<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { SiteIcon } from '@/types/icon'

const props = defineProps<{
  icon: SiteIcon
}>()

const settingsStore = useSettingsStore()

const openInNewTab = computed(
  () => props.icon.openInNewTab ?? settingsStore.settings.open.iconBlank
)

// 文字图标：优先 iconText，其次 name 首字母
const displayText = computed(() => {
  const t = props.icon.iconText?.trim()
  if (t) return t
  return props.icon.name?.charAt(0).toUpperCase() || '?'
})

// size 格式 "行x列"，图标本体边长取行列较小值（保证正方形）
// 本体尺寸 = scale × --icon-size + (scale-1) × --icon-gap
const iconScale = computed(() => {
  const parts = props.icon.size.split('x').map(Number)
  return Math.min(parts[0] ?? 1, parts[1] ?? 1)
})

const iconSizeStyle = computed(() => {
  const s = iconScale.value
  if (s <= 1) return 'var(--icon-size)'
  return `calc(var(--icon-size) * ${s} + var(--icon-gap) * ${s - 1})`
})

const fontSizeStyle = computed(() => {
  const s = iconScale.value
  if (s <= 1) return 'calc(var(--icon-size) * 0.4)'
  return `calc((var(--icon-size) * ${s} + var(--icon-gap) * ${s - 1}) * 0.35)`
})

function handleClick() {
  if (props.icon.url) {
    window.open(props.icon.url, openInNewTab.value ? '_blank' : '_self')
  }
}
</script>

<template>
  <button
    type="button"
    class="flex flex-col items-center gap-1 w-full min-w-0 group"
    :style="{ opacity: 'var(--icon-opacity)' }"
    @click="handleClick"
  >
    <div
      class="flex items-center justify-center rounded-[var(--icon-radius)] overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105"
      :style="{
        width: iconSizeStyle,
        height: iconSizeStyle,
        backgroundColor: icon.bgColor,
      }"
    >
      <img
        v-if="icon.icon && !icon.iconText"
        :src="icon.icon"
        :alt="icon.name"
        class="w-[60%] h-[60%] object-contain"
      />
      <span
        v-else
        class="text-white font-bold select-none leading-none text-center px-1"
        :style="{
          fontSize: displayText.length > 1
            ? `calc(${fontSizeStyle} * 0.75)`
            : fontSizeStyle
        }"
      >{{ displayText }}</span>
    </div>
    <span
      v-if="settingsStore.settings.icon.nameShow"
      class="text-[var(--icon-name-size)] truncate max-w-full text-center"
      :style="{ color: 'var(--icon-name-color)' }"
    >
      {{ icon.name }}
    </span>
  </button>
</template>
