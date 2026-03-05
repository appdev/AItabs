<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import SearchBar from '@/components/layout/SearchBar.vue'
import IconGrid from '@/components/layout/IconGrid.vue'
import FooterQuote from '@/components/layout/FooterQuote.vue'

const settingsStore = useSettingsStore()

// 弹窗状态（SettingsDialog/AddDialog 由 T12-T15 实现）
const showSettings = ref(false)
const showAdd = ref(false)
const addTab = ref<'widget' | 'nav' | 'custom'>('widget')

const wallpaper = computed(() => settingsStore.settings.wallpaper)
const sidebar = computed(() => settingsStore.settings.sidebar)
const layout = computed(() => settingsStore.settings.layout)

const isRightSidebar = computed(() => sidebar.value.placement === 'right')

const mainStyle = computed(() => ({
  marginLeft: isRightSidebar.value ? '0' : 'var(--sidebar-width)',
  marginRight: isRightSidebar.value ? 'var(--sidebar-width)' : '0',
}))

function openAdd(tab: typeof addTab.value) {
  addTab.value = tab
  showAdd.value = true
}

onMounted(() => {
  settingsStore.updateCSSVars()
})
</script>

<template>
  <div id="aitabs-app" class="relative w-full h-full overflow-hidden">

    <!-- 壁纸层 1：背景图 -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style="z-index: -3;"
      :style="{ backgroundImage: `url('${wallpaper.src}')` }"
    />

    <!-- 壁纸层 2：模糊层（scale(1.1) 防止边缘漏白） -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat scale-110"
      style="z-index: -2;"
      :style="{
        backgroundImage: `url('${wallpaper.src}')`,
        filter: 'blur(var(--wall-blur))',
      }"
    />

    <!-- 壁纸层 3：遮罩 -->
    <div
      class="fixed inset-0"
      style="z-index: -1;"
      :style="{ background: `rgba(0,0,0,var(--wall-mask))` }"
    />

    <!-- 侧边栏 -->
    <Sidebar @open-settings="showSettings = true" />

    <!-- 主内容区 -->
    <main
      class="h-full flex flex-col items-center overflow-y-auto"
      :style="mainStyle"
    >
      <div class="w-full flex flex-col items-center pt-8 pb-20 min-h-full">
        <!-- 时钟 -->
        <Header />

        <!-- 搜索栏 -->
        <SearchBar class="w-full max-w-xl px-4 mt-2" />

        <!-- 图标/组件网格 -->
        <IconGrid class="mt-6 px-4 w-full" />

        <!-- 添加按钮区 -->
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            class="glass-card px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-white/70 transition-colors flex items-center gap-1"
            @click="openAdd('widget')"
          >
            <Icon icon="mdi:plus" class="w-4 h-4" />
            添加组件
          </button>
          <button
            type="button"
            class="glass-card px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-white/70 transition-colors flex items-center gap-1"
            @click="openAdd('custom')"
          >
            <Icon icon="mdi:plus" class="w-4 h-4" />
            添加图标
          </button>
        </div>
      </div>
    </main>

    <!-- 底部一言 -->
    <FooterQuote v-if="layout.yiyan" />

    <!-- TODO T11: ContextMenu -->
    <!-- TODO T12-T14: SettingsDialog v-model:visible="showSettings" -->
    <!-- TODO T15: AddDialog v-model:visible="showAdd" :active-tab="addTab" -->
  </div>
</template>
