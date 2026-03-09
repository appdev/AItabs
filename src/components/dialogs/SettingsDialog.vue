<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useSettingsStore } from '@/stores/settings'
import { useGroupsStore } from '@/stores/groups'
import { useIconsStore } from '@/stores/icons'
import { useWidgetsStore } from '@/stores/widgets'
import { PRESET_COLORS } from '@/utils/color'
import { db } from '@/services/db'
import { applyWallpaper } from '@/composables/useWallpaper'
import { useAuth } from '@/composables/useAuth'
import { push, pull, fullSync, connectSSE, disconnectSSE, syncing, lastSyncTime } from '@/services/syncManager'
import { useContextMenu } from '@/composables/useContextMenu'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const settingsStore = useSettingsStore()
const groupsStore = useGroupsStore()
const iconsStore = useIconsStore()
const widgetsStore = useWidgetsStore()
const { username, isLoggedIn, login, register, logout } = useAuth()
const { activeSettingsMenu } = useContextMenu()

// 直接取响应式对象，修改后自动触发 CSS 更新和持久化
const settings = settingsStore.settings

const activeMenu = ref('search')

watch(activeSettingsMenu, (val) => {
  if (val) {
    activeMenu.value = val
  } else {
    activeMenu.value = 'search'
  }
}, { immediate: true })

const MENUS = [
  { key: 'search',    label: '搜索栏',    icon: 'mdi:magnify' },
  { key: 'icon',      label: '图标',      icon: 'mdi:apps' },
  { key: 'time',      label: '时间/日期', icon: 'mdi:clock-outline' },
  { key: 'wallpaper', label: '主题/壁纸', icon: 'mdi:palette-outline' },
  { key: 'layout',    label: '布局',      icon: 'mdi:view-dashboard-outline' },
  { key: 'account',   label: '账号同步',  icon: 'mdi:account-sync-outline' },
  { key: 'backup',    label: '备份恢复',  icon: 'mdi:cloud-sync-outline' },
  { key: 'reset',     label: '重置设置',  icon: 'mdi:refresh' },
  { key: 'about',     label: '关于',      icon: 'mdi:information-outline' },
]

// 账号面板表单状态
const authForm = ref({ username: '', password: '' })
const authError = ref('')
const authLoading = ref(false)

async function handleLogin() {
  if (!authForm.value.username || !authForm.value.password) {
    authError.value = '请填写用户名和密码'
    return
  }
  authLoading.value = true
  authError.value = ''
  try {
    await login(authForm.value.username, authForm.value.password)
    authForm.value = { username: '', password: '' }
    connectSSE()
    await fullSync()
    ElMessage.success('登录成功')
  } catch (err: any) {
    authError.value = err?.data?.error ?? '登录失败，请检查用户名和密码'
  } finally {
    authLoading.value = false
  }
}

async function handleRegister() {
  if (!authForm.value.username || !authForm.value.password) {
    authError.value = '请填写用户名和密码'
    return
  }
  authLoading.value = true
  authError.value = ''
  try {
    await register(authForm.value.username, authForm.value.password)
    authForm.value = { username: '', password: '' }
    connectSSE()
    await fullSync()
    ElMessage.success('注册成功')
  } catch (err: any) {
    authError.value = err?.data?.error ?? '注册失败，用户名可能已存在'
  } finally {
    authLoading.value = false
  }
}

async function handlePull() {
  try {
    await pull()
    ElMessage.success('同步完成')
  } catch {
    ElMessage.error('同步失败，请检查网络')
  }
}

async function handlePush() {
  try {
    await push()
    ElMessage.success('备份完成')
  } catch {
    ElMessage.error('备份失败，请检查网络')
  }
}

function handleLogout() {
  disconnectSSE()
  logout()
  ElMessage.success('已退出登录')
}

// 格式化上次同步时间
function formatSyncTime(ts: number): string {
  if (!ts) return '从未同步'
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 搜索引擎管理
const newEngineName = ref('')
const newEngineHref = ref('')

function removeSearchEngine(key: string) {
  settings.searchEngines = settings.searchEngines.filter(e => e.key !== key)
  if (settings.activeEngine === key && settings.searchEngines.length) {
    settings.activeEngine = settings.searchEngines[0]!.key
  }
}

function addSearchEngine() {
  if (!newEngineName.value.trim() || !newEngineHref.value.trim()) return
  const key = Date.now().toString(36)
  settings.searchEngines.push({
    key,
    title: newEngineName.value.trim(),
    href: newEngineHref.value.trim(),
  })
  newEngineName.value = ''
  newEngineHref.value = ''
}

// 间距同步：gapX 变动时同步到 gapY
watch(() => settings.icon.gapX, (val) => {
  if (settings.icon.gapSync) settings.icon.gapY = val
})

// 导出备份 JSON
function exportData() {
  const data = {
    settings: settingsStore.settings,
    groups: groupsStore.groups,
    icons: iconsStore.icons,
    widgets: widgetsStore.widgets,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'aitabs-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 从 JSON 导入备份
function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.settings) Object.assign(settingsStore.settings, data.settings)
        if (data.groups) groupsStore.groups = data.groups
        if (data.icons) iconsStore.icons = data.icons
        if (data.widgets) widgetsStore.widgets = data.widgets
        ElMessage.success('导入成功')
      } catch {
        ElMessage.error('导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 重置所有设置（含 groups/icons/widgets 恢复默认数据）
async function resetAll() {
  try {
    await ElMessageBox.confirm(
      '确定完全重置吗？所有设置、图标、分组、组件将恢复为默认状态，此操作不可撤销。',
      '重置设置',
      { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning' },
    )
    settingsStore.resetSettings()
    groupsStore.resetGroups()
    iconsStore.resetIcons()
    widgetsStore.resetWidgets()
    ElMessage.success('已重置为默认状态')
  } catch {}
}

// 上传本地壁纸 → 存入 IndexedDB（避免 base64 撑爆 localStorage）
function uploadWallpaper() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const data = ev.target?.result as string
      await db.wallpapers.put({ id: 'local', data })
      settings.wallpaper.type = 'local'
      settings.wallpaper.src = '' // 实际数据在 IndexedDB，src 留空
      // type/src 未变化时 watch 不会触发，主动调用确保立即生效
      await applyWallpaper()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// 时钟颜色预设（含白色系）
const TIME_COLORS = ['#ffffff', '#f5f5f5', '#FFE4C4', '#FFD700', '#87CEEB', '#98FB98', ...PRESET_COLORS.slice(0, 14)]
</script>

<template>
  <Teleport to="body">
    <Transition name="settings-slide">
      <div
        v-if="visible"
        class="settings-panel fixed top-0 right-0 bottom-0 z-[100] flex shadow-2xl rounded-l-[20px] overflow-hidden"
        style="width: 450px;"
      >
        <!-- 左侧菜单导航 -->
        <nav
          class="glass-dialog flex flex-col gap-0.5 py-4 px-2 overflow-y-auto flex-shrink-0"
          style="width: 130px; border-right: 1px solid rgba(0,0,0,0.08);"
        >
          <button
            v-for="menu in MENUS"
            :key="menu.key"
            type="button"
            class="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-center"
            :class="activeMenu === menu.key ? 'settings-nav-active bg-black/8' : 'hover:bg-black/5'"
            @click="activeMenu = menu.key"
          >
            <Icon :icon="menu.icon" class="w-5 h-5" />
            <span class="text-[11px] leading-tight">{{ menu.label }}</span>
          </button>
        </nav>

        <!-- 右侧内容区 -->
        <div class="flex-1 glass-dialog flex flex-col overflow-hidden">
          <!-- 顶部标题栏 -->
          <div class="flex items-center justify-end h-12 px-6 border-b border-black/8 dark:border-white/10 flex-shrink-0">
            <button
              type="button"
              class="text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white transition-colors"
              @click="emit('update:visible', false)"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
          </div>

          <!-- 各面板内容 -->
          <div class="flex-1 overflow-y-auto px-4 py-3">

            <!-- ===== 搜索栏面板 ===== -->
            <template v-if="activeMenu === 'search'">
              <div class="s-row">
                <span>显示搜索栏</span>
                <ElSwitch v-model="settings.search.show" size="small" />
              </div>
              <div class="s-row">
                <span>搜索历史</span>
                <ElSwitch v-model="settings.search.history" size="small" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>搜索栏高度</span><span class="val">{{ settings.search.height }}px</span>
                </div>
                <ElSlider v-model="settings.search.height" :min="30" :max="60" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>搜索栏圆角</span><span class="val">{{ settings.search.radius }}px</span>
                </div>
                <ElSlider v-model="settings.search.radius" :min="0" :max="30" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>背景透明度</span><span class="val">{{ settings.search.bgColor }}</span>
                </div>
                <ElSlider v-model="settings.search.bgColor" :min="0" :max="1" :step="0.05" :show-tooltip="false" />
              </div>

              <!-- 搜索引擎管理 -->
              <div class="py-2 border-b border-black/5 dark:border-white/8">
                <span class="text-gray-600 dark:text-gray-300 text-xs block mb-2">搜索引擎</span>
                <VueDraggable v-model="settings.searchEngines" :animation="150" handle=".drag-handle">
                  <div
                    v-for="engine in settings.searchEngines"
                    :key="engine.key"
                    class="flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors"
                    :class="settings.activeEngine === engine.key ? 'bg-black/5 dark:bg-white/8' : ''"
                  >
                    <Icon icon="mdi:drag-vertical" class="drag-handle w-3.5 h-3.5 text-gray-400 dark:text-white/40 cursor-grab flex-shrink-0" />
                    <span
                      class="text-[11px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      :class="settings.activeEngine === engine.key ? 'bg-blue-500/15 text-blue-700' : 'text-gray-700 hover:text-gray-900'"
                      @click="settings.activeEngine = engine.key"
                    >{{ engine.title }}</span>
                    <span class="text-gray-500 dark:text-white/50 text-[10px] flex-1 truncate">{{ engine.href }}</span>
                    <button
                      v-if="settings.searchEngines.length > 1"
                      type="button"
                      class="text-gray-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors flex-shrink-0"
                      @click="removeSearchEngine(engine.key)"
                    >
                      <Icon icon="mdi:close" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </VueDraggable>

                <!-- 添加新引擎 -->
                <div class="flex gap-1.5 mt-2">
                  <input
                    v-model="newEngineName"
                    placeholder="名称"
                    class="s-input"
                    style="width: 60px; flex-shrink: 0;"
                  />
                  <input
                    v-model="newEngineHref"
                    placeholder="URL（可用 %s 占位）"
                    class="s-input flex-1"
                    @keyup.enter="addSearchEngine"
                  />
                  <button
                    type="button"
                    class="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 bg-black/5 hover:bg-black/10 rounded-lg text-base transition-colors font-medium"
                    @click="addSearchEngine"
                  >+</button>
                </div>
              </div>
            </template>

            <!-- ===== 图标面板 ===== -->
            <template v-else-if="activeMenu === 'icon'">
              <div class="s-row">
                <span>显示图标名称</span>
                <ElSwitch v-model="settings.icon.nameShow" size="small" />
              </div>
              <div class="s-row">
                <span>图标样式</span>
                <div class="s-btngroup">
                  <button :class="{ active: settings.icon.style === 'default' }" @click="settings.icon.style = 'default'">默认</button>
                  <button :class="{ active: settings.icon.style === 'circle' }" @click="settings.icon.style = 'circle'">圆形</button>
                </div>
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>图标大小</span><span class="val">{{ settings.icon.iconSize }}px</span>
                </div>
                <ElSlider v-model="settings.icon.iconSize" :min="40" :max="80" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>图标圆角</span><span class="val">{{ settings.icon.iconRadius }}px</span>
                </div>
                <ElSlider v-model="settings.icon.iconRadius" :min="0" :max="50" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>不透明度</span><span class="val">{{ settings.icon.opacity }}</span>
                </div>
                <ElSlider v-model="settings.icon.opacity" :min="0" :max="1" :step="0.05" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>水平间距</span>
                  <span class="val flex items-center gap-1.5">
                    {{ settings.icon.gapX }}px
                    <span class="text-gray-500 dark:text-white/50 text-[10px]">同步</span>
                    <ElSwitch v-model="settings.icon.gapSync" size="small" />
                  </span>
                </div>
                <ElSlider v-model="settings.icon.gapX" :min="10" :max="60" :show-tooltip="false" />
              </div>
              <div v-if="!settings.icon.gapSync" class="s-slider">
                <div class="s-slider-label">
                  <span>垂直间距</span><span class="val">{{ settings.icon.gapY }}px</span>
                </div>
                <ElSlider v-model="settings.icon.gapY" :min="10" :max="60" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>名称字号</span><span class="val">{{ settings.icon.nameSize }}px</span>
                </div>
                <ElSlider v-model="settings.icon.nameSize" :min="10" :max="18" :show-tooltip="false" />
              </div>
              <div class="s-color">
                <div class="flex items-center justify-between mb-2">
                  <span>名称颜色</span>
                  <input type="color" v-model="settings.icon.nameColor" class="color-input" title="自定义" />
                </div>
                <div class="color-dots">
                  <button
                    v-for="c in PRESET_COLORS"
                    :key="c"
                    class="color-dot"
                    :style="{ backgroundColor: c, outline: settings.icon.nameColor === c ? '2px solid #fff' : 'none' }"
                    @click="settings.icon.nameColor = c"
                  />
                </div>
              </div>
              <div class="s-row">
                <span>最大宽度</span>
                <div class="flex items-center gap-1">
                  <ElInputNumber
                    v-model="settings.icon.maxWidth"
                    :min="settings.icon.maxWidthUnit === '%' ? 10 : 400"
                    :max="settings.icon.maxWidthUnit === '%' ? 100 : 2000"
                    :step="settings.icon.maxWidthUnit === '%' ? 5 : 50"
                    size="small" controls-position="right"
                    style="width: 100px;"
                  />
                  <div class="s-btngroup">
                    <button :class="{ active: settings.icon.maxWidthUnit === 'px' }" @click="settings.icon.maxWidthUnit = 'px'">px</button>
                    <button :class="{ active: settings.icon.maxWidthUnit === '%' }" @click="settings.icon.maxWidthUnit = '%'">%</button>
                  </div>
                </div>
              </div>
            </template>

            <!-- ===== 时间/日期面板 ===== -->
            <template v-else-if="activeMenu === 'time'">
              <div class="s-row">
                <span>显示时钟</span>
                <ElSwitch v-model="settings.time.show" size="small" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>字号大小</span><span class="val">{{ settings.time.size }}px</span>
                </div>
                <ElSlider v-model="settings.time.size" :min="40" :max="120" :show-tooltip="false" />
              </div>
              <div class="s-row">
                <span>24 小时制</span>
                <ElSwitch v-model="settings.time.hour24" size="small" />
              </div>
              <div class="s-row">
                <span>显示秒钟</span>
                <ElSwitch v-model="settings.time.sec" size="small" />
              </div>
              <div class="s-row">
                <span>显示月份</span>
                <ElSwitch v-model="settings.time.month" size="small" />
              </div>
              <div class="s-row">
                <span>显示星期</span>
                <ElSwitch v-model="settings.time.week" size="small" />
              </div>
              <div class="s-row">
                <span>显示农历</span>
                <ElSwitch v-model="settings.time.lunar" size="small" />
              </div>
              <div class="s-color">
                <div class="flex items-center justify-between mb-2">
                  <span>时钟颜色</span>
                  <input type="color" v-model="settings.time.color" class="color-input" title="自定义" />
                </div>
                <div class="color-dots">
                  <button
                    v-for="c in TIME_COLORS"
                    :key="c"
                    class="color-dot"
                    :style="{ backgroundColor: c, outline: settings.time.color === c ? '2px solid #fff' : 'none' }"
                    @click="settings.time.color = c"
                  />
                </div>
              </div>
            </template>

            <!-- ===== 主题/壁纸面板 ===== -->
            <template v-else-if="activeMenu === 'wallpaper'">
              <div class="s-row">
                <span>主题模式</span>
                <div class="s-btngroup">
                  <button :class="{ active: settings.theme.mode === 'light' }" @click="settings.theme.mode = 'light'">浅色</button>
                  <button :class="{ active: settings.theme.mode === 'dark' }" @click="settings.theme.mode = 'dark'">深色</button>
                </div>
              </div>
              <div class="s-row">
                <span>跟随系统</span>
                <ElSwitch v-model="settings.theme.system" size="small" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>壁纸遮罩</span><span class="val">{{ settings.wallpaper.mask }}</span>
                </div>
                <ElSlider v-model="settings.wallpaper.mask" :min="0" :max="1" :step="0.05" :show-tooltip="false" />
              </div>
              <div class="s-slider">
                <div class="s-slider-label">
                  <span>壁纸模糊</span><span class="val">{{ settings.wallpaper.blur }}px</span>
                </div>
                <ElSlider v-model="settings.wallpaper.blur" :min="0" :max="30" :show-tooltip="false" />
              </div>
              <div class="py-2 border-b border-black/5 dark:border-white/8">
                <span class="text-gray-600 dark:text-gray-300 text-xs block mb-2">壁纸来源</span>
                <div class="s-btngroup w-full">
                  <button class="flex-1" :class="{ active: settings.wallpaper.type === 'default' }" @click="settings.wallpaper.type = 'default'; settings.wallpaper.src = '/bg.webp'">默认</button>
                  <button class="flex-1" :class="{ active: settings.wallpaper.type === 'bing' }" @click="settings.wallpaper.type = 'bing'">Bing 每日</button>
                  <button class="flex-1" :class="{ active: settings.wallpaper.type === 'url' }" @click="settings.wallpaper.type = 'url'; if (!settings.wallpaper.src || settings.wallpaper.src === '/bg.webp') settings.wallpaper.src = 'https://cn.bing.com/th?id=OHR.GoremeTwilight_EN-US3224835148_UHD.jpg&pid=hp&w=1920'">URL</button>
                  <button class="flex-1" :class="{ active: settings.wallpaper.type === 'local' }" @click="uploadWallpaper">本地</button>
                </div>
                <ElInput
                  v-if="settings.wallpaper.type === 'url'"
                  v-model="settings.wallpaper.src"
                  placeholder="输入壁纸图片 URL"
                  size="small"
                  class="mt-2"
                  clearable
                />
              </div>
            </template>

            <!-- ===== 布局面板 ===== -->
            <template v-else-if="activeMenu === 'layout'">
              <div class="s-row">
                <span>视图模式</span>
                <div class="s-btngroup">
                  <button :class="{ active: settings.layout.view === 'widget' }" @click="settings.layout.view = 'widget'">组件</button>
                  <button :class="{ active: settings.layout.view === 'simple' }" @click="settings.layout.view = 'simple'">简洁</button>
                </div>
              </div>
              <div class="s-row">
                <span>显示一言</span>
                <ElSwitch v-model="settings.layout.yiyan" size="small" />
              </div>
            </template>

            <!-- ===== 账号同步面板 ===== -->
            <template v-else-if="activeMenu === 'account'">

              <!-- 未登录 -->
              <template v-if="!isLoggedIn">
                <p class="text-gray-500 dark:text-white/60 text-xs mb-4 leading-relaxed">
                  登录账号后，数据将自动在多设备间同步。
                </p>
                <div class="space-y-2">
                  <ElInput
                    v-model="authForm.username"
                    placeholder="用户名（3-20 位字母数字下划线）"
                    size="small"
                    clearable
                    @keyup.enter="handleLogin"
                  />
                  <ElInput
                    v-model="authForm.password"
                    placeholder="密码（6-50 位）"
                    type="password"
                    size="small"
                    show-password
                    @keyup.enter="handleLogin"
                  />
                  <p v-if="authError" class="text-red-400 text-[11px]">{{ authError }}</p>
                  <div class="flex gap-2 pt-1">
                    <button
                      type="button"
                      class="s-action-btn flex-1 justify-center"
                      :disabled="authLoading"
                      @click="handleLogin"
                    >
                      <Icon v-if="authLoading" icon="mdi:loading" class="w-4 h-4 animate-spin" />
                      <Icon v-else icon="mdi:login" class="w-4 h-4" />
                      登录
                    </button>
                    <button
                      type="button"
                      class="s-action-btn flex-1 justify-center"
                      :disabled="authLoading"
                      @click="handleRegister"
                    >
                      <Icon icon="mdi:account-plus-outline" class="w-4 h-4" />
                      注册
                    </button>
                  </div>
                </div>
              </template>

              <!-- 已登录 -->
              <template v-else>
                <div class="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 mb-4">
                  <div class="flex items-center gap-2">
                    <Icon icon="mdi:account-circle-outline" class="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p class="text-gray-700 dark:text-gray-200 text-xs font-medium">已登录：{{ username }}</p>
                      <p class="text-gray-500 dark:text-white/50 text-[10px] mt-0.5">上次同步：{{ formatSyncTime(lastSyncTime) }}</p>
                    </div>
                    <div v-if="syncing" class="ml-auto">
                      <Icon icon="mdi:loading" class="w-4 h-4 text-blue-400 animate-spin" />
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <button type="button" class="s-action-btn w-full justify-start" @click="handlePull">
                    <Icon icon="mdi:cloud-download-outline" class="w-4 h-4" />
                    同步到本地
                  </button>
                  <button type="button" class="s-action-btn w-full justify-start" @click="handlePush">
                    <Icon icon="mdi:cloud-upload-outline" class="w-4 h-4" />
                    立即备份
                  </button>
                  <button type="button" class="s-action-btn w-full justify-start danger" @click="handleLogout">
                    <Icon icon="mdi:logout" class="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </template>

            </template>

            <!-- ===== 备份恢复面板 ===== -->
            <template v-else-if="activeMenu === 'backup'">
              <div class="py-3 border-b border-black/5 dark:border-white/8">
                <p class="text-gray-500 dark:text-white/60 text-xs mb-3 leading-relaxed">将所有设置、图标、分组、组件数据导出为 JSON 文件。</p>
                <button type="button" class="s-action-btn" @click="exportData">
                  <Icon icon="mdi:download-outline" class="w-4 h-4" />
                  导出数据
                </button>
              </div>
              <div class="py-3">
                <p class="text-gray-500 dark:text-white/60 text-xs mb-3 leading-relaxed">从备份文件导入，将覆盖当前所有设置和数据。</p>
                <button type="button" class="s-action-btn" @click="importData">
                  <Icon icon="mdi:upload-outline" class="w-4 h-4" />
                  导入数据
                </button>
              </div>
            </template>

            <!-- ===== 重置设置面板 ===== -->
            <template v-else-if="activeMenu === 'reset'">
              <div class="py-3 space-y-4">
                <div class="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <p class="text-red-500 text-xs leading-relaxed font-medium mb-1">⚠️ 完全重置</p>
                  <p class="text-gray-500 dark:text-white/60 text-xs leading-relaxed">
                    将同时重置所有外观设置、图标、分组和组件数据，恢复到初始默认状态。此操作不可撤销。
                  </p>
                </div>
                <button type="button" class="s-action-btn danger" @click="resetAll">
                  <Icon icon="mdi:refresh" class="w-4 h-4" />
                  重置为默认状态
                </button>
              </div>
            </template>

            <!-- ===== 关于面板 ===== -->
            <template v-else-if="activeMenu === 'about'">
              <div class="flex flex-col items-center py-8 gap-4">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden bg-transparent">
                  <img src="/logo.svg" alt="AItabs Logo" class="w-full h-full object-cover" />
                </div>
                <div class="text-center">
                  <h3 class="text-gray-700 dark:text-white/90 font-semibold text-base">AItabs</h3>
                  <p class="text-gray-700 dark:text-white/90 text-xs mt-1">新标签页 v1.0.0</p>
                </div>
                <p class="text-gray-700 dark:text-white/90 text-[11px] text-center leading-relaxed max-w-[180px]">
                  一个简洁高效、可高度定制的浏览器新标签页应用
                </p>
                <div class="text-gray-700 dark:text-white/90 text-[11px] text-center space-y-1">
                  <p>基于 Vue 3 + TypeScript + Vite 构建</p>
                </div>
                <a
                  href="https://github.com/appdev/AItabs"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 dark:text-white/90 dark:hover:text-white transition-colors text-xs"
                >
                  <Icon icon="mdi:github" class="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </template>

          </div>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[99] bg-black/20"
        @click="emit('update:visible', false)"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.settings-slide-enter-from,
.settings-slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 设置行 */
.s-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

/* 带滑块的设置项 */
.s-slider {
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.s-slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 6px;
}

.val {
  color: rgba(0, 0, 0, 0.4);
}

/* 按钮组 */
.s-btngroup {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.s-btngroup button {
  padding: 3px 10px;
  font-size: 11px;
  border-radius: 6px;
  transition: all 0.15s;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}

.s-btngroup button:hover {
  color: rgba(0, 0, 0, 0.8);
}

.s-btngroup button.active {
  background: rgba(255, 255, 255, 0.8);
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 颜色选择区 */
.s-color {
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

.color-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  outline-offset: 2px;
  transition: transform 0.15s;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-input {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
}

/* 统一输入框样式 */
.s-input {
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 7px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.75);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.s-input::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

.s-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.6);
}

/* 操作按钮 */
.s-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.15s;
}

.s-action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.85);
}

.s-action-btn.danger {
  color: #ef4444;
}

.s-action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

</style>
