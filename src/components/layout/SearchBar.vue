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

// 从 href 中提取 favicon
function getFavicon(href: string): string {
  try {
    const domain = new URL(href).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

const activeFavicon = computed(() => getFavicon(activeEngine.value?.href ?? ''))

// 聚焦状态（加深搜索框背景）
const isFocused = ref(false)

// 引擎选择面板
const showEnginePanel = ref(false)

function toggleEnginePanel() {
  showEnginePanel.value = !showEnginePanel.value
}

function selectEngine(key: string) {
  settingsStore.settings.activeEngine = key
  showEnginePanel.value = false
}

// Tab 键循环切换搜索引擎
function cycleEngine() {
  const engines = searchEngines.value
  const idx = engines.findIndex(e => e.key === activeEngineKey.value)
  const next = engines[(idx + 1) % engines.length]
  if (next) settingsStore.settings.activeEngine = next.key
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
  isFocused.value = true
  showEnginePanel.value = false
  if (searchSettings.value.history && historyList.value.length) {
    showHistory.value = true
  }
}

function onInputBlur() {
  isFocused.value = false
  setTimeout(() => { showHistory.value = false }, 200)
}

// ===== 搜索提交 =====
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

// 点击外部关闭引擎面板
function onClickOutside(e: MouseEvent) {
  const el = document.getElementById('search-bar-wrap')
  if (el && !el.contains(e.target as Node)) {
    showEnginePanel.value = false
  }
}

// 全局 / 键聚焦搜索框
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
  document.addEventListener('mousedown', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <div
    v-if="searchSettings.show"
    id="search-bar-wrap"
    class="flex flex-col items-center w-full max-w-[600px] mx-auto"
  >
    <!-- 搜索框 -->
    <div class="w-full relative">
      <form
        class="w-full flex items-center overflow-hidden transition-colors"
        style="backdrop-filter: blur(6px);"
        :style="{
          height: 'var(--search-height)',
          borderRadius: 'var(--search-radius)',
          background: isFocused
            ? 'rgba(var(--search-bg-rgb), var(--search-bg-focused-opacity))'
            : 'rgba(var(--search-bg-rgb), var(--search-bg-opacity))',
        }"
        @submit="handleSubmit"
      >
        <!-- 左侧：引擎图标 + 下拉箭头，点击展开引擎面板 -->
        <button
          type="button"
          class="flex-shrink-0 flex items-center justify-center gap-0.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style="min-width: 52px; padding: 0 10px;"
          @click.stop="toggleEnginePanel"
        >
          <img
            v-if="activeFavicon"
            :src="activeFavicon"
            :alt="activeEngine?.title"
            class="w-5 h-5"
            @error="($event.target as HTMLImageElement).style.display='none'"
          />
          <Icon v-else icon="mdi:magnify" class="w-5 h-5 text-gray-500 dark:text-gray-300" />
          <Icon icon="mdi:chevron-down" class="w-3 h-3 text-gray-400 ml-0.5" />
        </button>

        <!-- 中间：输入框 -->
        <input
          ref="inputEl"
          v-model="query"
          type="search"
          class="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm h-full"
          placeholder="输入搜索内容"
          autocomplete="off"
          @focus="onInputFocus"
          @blur="onInputBlur"
          @keydown.tab.prevent="cycleEngine"
          @keydown.esc="($event.target as HTMLInputElement).blur()"
        />

        <!-- 右侧：搜索按钮 -->
        <button
          type="submit"
          class="flex-shrink-0 flex items-center justify-center h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-300"
          style="min-width: 46px;"
        >
          <Icon icon="mdi:magnify" class="w-[22px] h-[22px]" />
        </button>
      </form>

      <!-- 引擎选择面板（点击左侧触发，白色卡片下拉） -->
      <div
        v-if="showEnginePanel"
        class="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-xl py-3 px-3 glass-search-engine"
        @click.stop
      >
        <div class="flex gap-1">
          <button
            v-for="engine in searchEngines"
            :key="engine.key"
            type="button"
            class="flex flex-col items-center gap-1 rounded-xl py-2 transition-colors flex-1"
            :class="activeEngineKey === engine.key ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/5'"
            @click="selectEngine(engine.key)"
          >
            <!-- 白色方块背景 + 引擎图标 -->
            <div class="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center shadow-sm">
              <img
                :src="getFavicon(engine.href)"
                :alt="engine.title"
                class="w-6 h-6"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
            </div>
            <span class="text-xs text-gray-700 dark:text-gray-300 leading-none">{{ engine.title }}</span>
          </button>
        </div>
      </div>

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
  </div>
</template>
