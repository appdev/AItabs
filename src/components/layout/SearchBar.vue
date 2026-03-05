<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const query = ref('')

const searchSettings = computed(() => settingsStore.settings.search)
const searchEngines = computed(() => settingsStore.settings.searchEngines)
const activeEngineKey = computed(() => settingsStore.settings.activeEngine)
const activeEngine = computed(
  () => searchEngines.value.find(e => e.key === activeEngineKey.value) ?? searchEngines.value[0]
)

function setActiveEngine(key: string) {
  settingsStore.settings.activeEngine = key
}

function handleSubmit(e: Event) {
  e.preventDefault()
  if (!query.value.trim()) return
  const href = activeEngine.value ? `${activeEngine.value.href}${encodeURIComponent(query.value.trim())}` : ''
  if (href) {
    window.open(href, settingsStore.settings.open.searchBlank ? '_blank' : '_self')
  }
}
</script>

<template>
  <div
    v-if="searchSettings.show"
    class="flex flex-col items-center gap-2 w-full max-w-xl mx-auto"
  >
    <form
      class="w-full flex items-center gap-2 px-3 overflow-hidden"
      style="backdrop-filter: blur(6px);"
      :style="{
        height: 'var(--search-height)',
        borderRadius: 'var(--search-radius)',
        background: 'rgba(255,255,255,var(--search-bg-color))',
      }"
      @submit="handleSubmit"
    >
      <Icon icon="mdi:magnify" class="w-5 h-5 flex-shrink-0 text-gray-600" aria-hidden="true" />
      <input
        v-model="query"
        type="search"
        class="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
        :placeholder="`在 ${activeEngine?.title ?? '搜索引擎'} 中搜索...`"
        autocomplete="off"
      />
      <button
        type="submit"
        class="flex-shrink-0 px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
      >
        搜索
      </button>
    </form>

    <!-- 搜索引擎标签 -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="engine in searchEngines"
        :key="engine.key"
        type="button"
        class="px-2.5 py-1 rounded-md text-xs transition-colors"
        :class="
          activeEngineKey === engine.key
            ? 'bg-white/40 text-gray-900 font-medium'
            : 'bg-white/20 text-white/80 hover:bg-white/30'
        "
        @click="setActiveEngine(engine.key)"
      >
        {{ engine.title }}
      </button>
    </div>
  </div>
</template>
