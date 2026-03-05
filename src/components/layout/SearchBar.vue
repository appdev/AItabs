<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const query = ref('')
const inputEl = ref<HTMLInputElement>()

const searchSettings = computed(() => settingsStore.settings.search)
const searchEngines = computed(() => settingsStore.settings.searchEngines)
const activeEngineKey = computed(() => settingsStore.settings.activeEngine)
const activeEngine = computed(
  () => searchEngines.value.find(e => e.key === activeEngineKey.value) ?? searchEngines.value[0]
)

function setActiveEngine(key: string) {
  settingsStore.settings.activeEngine = key
}

// Tab 键循环切换搜索引擎
function cycleEngine() {
  const engines = searchEngines.value
  const idx = engines.findIndex(e => e.key === activeEngineKey.value)
  const next = engines[(idx + 1) % engines.length]
  if (next) setActiveEngine(next.key)
}

// ===== 搜索历史 =====
const HISTORY_KEY = 'aitabs-search-history'
const historyList = ref<string[]>([])
const showHistory = ref(false)

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    historyList.value = raw ? JSON.parse(raw) : []
  } catch {
    historyList.value = []
  }
}

function saveToHistory(q: string) {
  if (!searchSettings.value.history) return
  const list = [q, ...historyList.value.filter(h => h !== q)].slice(0, 5)
  historyList.value = list
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

function clearHistory() {
  historyList.value = []
  localStorage.removeItem(HISTORY_KEY)
}

function selectHistory(item: string) {
  query.value = item
  showHistory.value = false
  doSearch(item)
}

function onInputFocus() {
  if (searchSettings.value.history && historyList.value.length) {
    showHistory.value = true
  }
}

function onInputBlur() {
  // 延迟关闭，让点击历史项的事件先触发
  setTimeout(() => { showHistory.value = false }, 200)
}

// ===== 搜索提交 =====
// 支持 %s 占位符模板，也支持直接前缀拼接
function buildUrl(href: string, q: string): string {
  const encoded = encodeURIComponent(q)
  return href.includes('%s') ? href.replace('%s', encoded) : href + encoded
}

function doSearch(q: string) {
  const href = activeEngine.value?.href ?? ''
  const url = buildUrl(href, q)
  if (url) window.open(url, settingsStore.settings.open.searchBlank ? '_blank' : '_self')
}

function handleSubmit(e: Event) {
  e.preventDefault()
  const q = query.value.trim()
  if (!q) return
  saveToHistory(q)
  doSearch(q)
  showHistory.value = false
}

// 全局 / 键聚焦搜索框（不在其他输入框中时生效）
function onGlobalKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
  if (e.key === '/') {
    e.preventDefault()
    inputEl.value?.focus()
  }
}

onMounted(() => {
  loadHistory()
  document.addEventListener('keydown', onGlobalKeydown)
})
onUnmounted(() => document.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <div
    v-if="searchSettings.show"
    class="flex flex-col items-center gap-2 w-full max-w-xl mx-auto"
  >
    <!-- 搜索框 -->
    <div class="w-full relative">
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
          ref="inputEl"
          v-model="query"
          type="search"
          class="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
          placeholder="输入搜索内容"
          autocomplete="off"
          @focus="onInputFocus"
          @blur="onInputBlur"
          @keydown.tab.prevent="cycleEngine"
          @keydown.esc="($event.target as HTMLInputElement).blur()"
        />
        <button
          type="submit"
          class="flex-shrink-0 px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
        >
          搜索
        </button>
      </form>

      <!-- 搜索历史下拉 -->
      <div
        v-if="showHistory && historyList.length"
        class="absolute left-0 right-0 top-full mt-1 z-50 glass-card rounded-xl overflow-hidden shadow-lg"
      >
        <div class="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
          <span class="text-white/50 text-xs">最近搜索</span>
          <button
            type="button"
            class="text-white/30 hover:text-white/70 text-xs transition-colors"
            @click="clearHistory"
          >
            清除
          </button>
        </div>
        <button
          v-for="item in historyList"
          :key="item"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors text-left"
          @click="selectHistory(item)"
        >
          <Icon icon="mdi:history" class="w-4 h-4 text-white/40 flex-shrink-0" />
          {{ item }}
        </button>
      </div>
    </div>

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
