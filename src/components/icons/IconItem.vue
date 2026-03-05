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

const firstChar = computed(() => props.icon.name?.charAt(0).toUpperCase() || '?')

function handleClick() {
  if (props.icon.url) {
    window.open(props.icon.url, openInNewTab.value ? '_blank' : '_self')
  }
}
</script>

<template>
  <button
    type="button"
    class="flex flex-col items-center gap-1 w-full h-full min-w-0 group"
    :style="{ opacity: 'var(--icon-opacity)' }"
    @click="handleClick"
  >
    <div
      class="flex items-center justify-center rounded-[var(--icon-radius)] overflow-hidden flex-shrink-0 transition-transform group-hover:scale-110"
      :style="{
        width: 'var(--icon-size)',
        height: 'var(--icon-size)',
        backgroundColor: icon.bgColor,
      }"
    >
      <img
        v-if="icon.icon"
        :src="icon.icon"
        :alt="icon.name"
        class="w-[60%] h-[60%] object-contain"
      />
      <span
        v-else
        class="text-white font-bold select-none"
        :style="{ fontSize: 'calc(var(--icon-size) * 0.4)' }"
      >{{ firstChar }}</span>
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
