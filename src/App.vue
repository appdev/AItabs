<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaper } from '@/composables/useWallpaper'
import { useContextMenu } from '@/composables/useContextMenu'
import { useAuth } from '@/composables/useAuth'
import { useEditMode } from '@/composables/useEditMode'
import { initAutoSync, connectSSE, pull } from '@/services/syncManager'
import Header from '@/components/layout/Header.vue'
import SearchBar from '@/components/layout/SearchBar.vue'
import IconGrid from '@/components/layout/IconGrid.vue'
import FooterQuote from '@/components/layout/FooterQuote.vue'
import ContextMenu from '@/components/contextmenu/ContextMenu.vue'
import UndoToast from '@/components/common/UndoToast.vue'

// 弹窗类组件按需加载，减少首屏包体积
const SettingsDialog = defineAsyncComponent(() => import('@/components/dialogs/SettingsDialog.vue'))
const AddDialog = defineAsyncComponent(() => import('@/components/dialogs/AddDialog.vue'))
const WidgetConfigDialog = defineAsyncComponent(() => import('@/components/dialogs/WidgetConfigDialog.vue'))

const settingsStore = useSettingsStore()
const { activeSrc, wallpaperOpacity } = useWallpaper()
const { showSettingsFromMenu, showAddIconFromMenu, showEditIcon, editIconId } = useContextMenu()
const { isLoggedIn, checkSession } = useAuth()
const { setEditMode } = useEditMode()

const showSettings = ref(false)
const showAdd = ref(false)
const addTab = ref<'widget' | 'nav' | 'custom'>('widget')
const currentEditIconId = ref('')

watch(showSettingsFromMenu, (val) => {
  if (val) {
    showSettings.value = true
    showSettingsFromMenu.value = false
  }
})

watch(showEditIcon, (val) => {
  if (val) {
    currentEditIconId.value = editIconId.value
    addTab.value = 'custom'
    showAdd.value = true
    showEditIcon.value = false
  }
})

watch(showAddIconFromMenu, (val) => {
  if (val) {
    currentEditIconId.value = ''
    addTab.value = 'custom'
    showAdd.value = true
    showAddIconFromMenu.value = false
  }
})

watch(showAdd, (val) => {
  if (!val) currentEditIconId.value = ''
})

const layout = computed(() => settingsStore.settings.layout)

function openAdd(tab: typeof addTab.value) {
  currentEditIconId.value = ''
  addTab.value = tab
  showAdd.value = true
}

onMounted(async () => {
  settingsStore.updateCSSVars()

  // 初始化自动同步监听（防抖 2 秒触发 push）
  initAutoSync()

  // 验证已保存的 token，有效则拉取最新数据并连接 SSE
  const valid = await checkSession()
  if (valid && isLoggedIn.value) {
    try { await pull() } catch { /* 首次拉取失败不影响启动 */ }
    connectSSE()
  }
})
</script>

<template>
  <div id="aitabs-app" class="relative w-full h-full overflow-hidden" @click="setEditMode(false)">

    <!-- 壁纸层 1：背景图（预加载完成后淡入） -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style="z-index: -3; transition: opacity 0.5s ease;"
      :style="{ backgroundImage: `url('${activeSrc}')`, opacity: wallpaperOpacity }"
    />

    <!-- 壁纸层 2：模糊层 -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat scale-110"
      style="z-index: -2; transition: opacity 0.5s ease;"
      :style="{
        backgroundImage: `url('${activeSrc}')`,
        filter: 'blur(var(--wall-blur))',
        opacity: wallpaperOpacity,
      }"
    />

    <!-- 壁纸层 3：遮罩 -->
    <div
      class="fixed inset-0"
      style="z-index: -1;"
      :style="{ background: `rgba(0,0,0,var(--wall-mask))` }"
    />

    <!-- 右上角设置按钮 -->
    <button
      type="button"
      class="fixed top-4 right-4 z-[50] w-9 h-9 flex items-center justify-center rounded-full glass-card text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-black/30 transition-colors"
      aria-label="设置"
      @click="showSettings = true"
    >
      <Icon icon="mdi:cog-outline" class="w-5 h-5" />
    </button>

    <!-- 主内容区 -->
    <main class="h-full flex flex-col items-center overflow-y-auto" @click.self="setEditMode(false)">
      <div class="w-full flex flex-col items-center pt-8 pb-20 min-h-full" @click.self="setEditMode(false)">
        <Header />
        <SearchBar class="w-full max-w-xl px-4 mt-2" />
        <IconGrid class="mt-6 px-4 w-full" @add-icon="openAdd('custom')" />
      </div>
    </main>

    <FooterQuote v-if="layout.yiyan" />

    <ContextMenu />
    <UndoToast />

    <SettingsDialog v-model:visible="showSettings" />
    <AddDialog v-model:visible="showAdd" :active-tab="addTab" :edit-icon-id="currentEditIconId" />
    <WidgetConfigDialog />
  </div>
</template>
