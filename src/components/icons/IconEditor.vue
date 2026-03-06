<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useIconsStore } from '@/stores/icons'
import { fetchSiteInfo } from '@/services/api'
import { PRESET_COLORS } from '@/utils/color'
import type { SiteIcon, IconSize } from '@/types/icon'

const props = defineProps<{
  visible: boolean
  iconId: string
}>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const iconsStore = useIconsStore()

const SIZES: IconSize[] = ['1x1', '1x2', '2x1', '2x2', '2x4']
const SOURCE_TABS = [
  { key: 'url', label: 'URL' },
  { key: 'text', label: '文字' },
  { key: 'upload', label: '上传' },
] as const
type IconSource = 'url' | 'text' | 'upload'

const form = ref({
  url: '',
  name: '',
  icon: '',
  iconText: '',
  bgColor: '#0984fe',
  size: '1x1' as IconSize,
  openInNewTab: true,
  source: 'url' as IconSource,
})

const fetching = ref(false)
const forceRefreshing = ref(false)

// 每次打开弹窗时从 store 同步最新数据
watch(() => props.iconId, (id) => {
  const icon = iconsStore.icons.find(i => i.id === id)
  if (!icon) return
  form.value = {
    url: icon.url,
    name: icon.name,
    icon: icon.icon,
    iconText: icon.iconText ?? '',
    bgColor: icon.bgColor,
    size: icon.size,
    openInNewTab: icon.openInNewTab ?? true,
    source: icon.icon ? 'url' : 'text',
  }
}, { immediate: true })

async function fetchInfo() {
  if (!form.value.url) return
  fetching.value = true
  try {
    const res = await fetchSiteInfo(form.value.url)
    if (res.code === 200 && res.data) {
      if (res.data.name) form.value.name = res.data.name
      const iconUrl = res.data.imgSrc || res.data.src || ''
      if (iconUrl) { form.value.icon = iconUrl; form.value.source = 'url' }
      if (res.data.backgroundColor) form.value.bgColor = res.data.backgroundColor
    }
  } catch { /* 获取失败静默处理 */ }
  fetching.value = false
}

async function forceRefresh() {
  if (!form.value.url) return
  forceRefreshing.value = true
  try {
    const res = await fetchSiteInfo(form.value.url, true)
    if (res.code === 200 && res.data) {
      if (res.data.name) form.value.name = res.data.name
      const iconUrl = res.data.imgSrc || res.data.src || ''
      if (iconUrl) { form.value.icon = iconUrl; form.value.source = 'url' }
      if (res.data.backgroundColor) form.value.bgColor = res.data.backgroundColor
      ElMessage.success('图标已更新')
    } else {
      ElMessage.warning('未获取到新数据')
    }
  } catch {
    ElMessage.error('刷新失败，请稍后重试')
  } finally {
    forceRefreshing.value = false
  }
}

function uploadIcon() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      form.value.icon = ev.target?.result as string
      form.value.source = 'upload'
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function onSourceClick(key: IconSource) {
  if (key === 'upload') {
    uploadIcon()
  } else {
    form.value.source = key
  }
}

function save() {
  if (!props.iconId) return
  const updates: Partial<SiteIcon> = {
    url: form.value.url,
    name: form.value.name,
    bgColor: form.value.bgColor,
    size: form.value.size,
    openInNewTab: form.value.openInNewTab,
  }
  if (form.value.source === 'text') {
    updates.icon = ''
    updates.iconText = form.value.iconText || form.value.name
  } else {
    updates.icon = form.value.icon
    updates.iconText = ''
  }
  iconsStore.updateIcon(props.iconId, updates)
  emit('update:visible', false)
}

// 预览框显示内容
const previewText = computed(() => {
  if (form.value.source === 'text') {
    return form.value.iconText || form.value.name || '?'
  }
  return form.value.name.slice(0, 1).toUpperCase() || '?'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[200] flex items-center justify-center p-6"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40" @click="emit('update:visible', false)" />

        <!-- 弹窗主体 -->
        <div class="relative glass-dialog rounded-2xl overflow-hidden" style="width: 460px;">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-black/8">
            <h2 class="text-gray-800 font-medium text-sm">编辑图标</h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700 transition-colors"
              @click="emit('update:visible', false)"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="p-5 flex gap-5">

            <!-- 左：实时预览 -->
            <div class="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                class="w-[64px] h-[64px] rounded-[18px] overflow-hidden flex items-center justify-center shadow"
                :style="{ backgroundColor: form.bgColor }"
              >
                <img
                  v-if="form.source !== 'text' && form.icon"
                  :src="form.icon"
                  class="w-10 h-10 object-contain"
                  @error="form.icon = ''"
                />
                <span v-else class="text-white text-lg font-medium select-none">
                  {{ previewText }}
                </span>
              </div>
              <span class="text-gray-400 text-[11px]">预览</span>
            </div>

            <!-- 右：表单 -->
            <div class="flex-1 space-y-3 min-w-0">

              <!-- URL + 获取 -->
              <div class="flex gap-2">
                <ElInput v-model="form.url" placeholder="网站地址" size="small" class="flex-1" />
                <ElButton size="small" :loading="fetching" @click="fetchInfo">获取</ElButton>
                <ElButton type="warning" size="small" :loading="forceRefreshing" :disabled="!form.url" @click="forceRefresh">强制刷新</ElButton>
              </div>

              <!-- 名称 -->
              <ElInput v-model="form.name" placeholder="名称" size="small" />

              <!-- 图标来源 -->
              <div>
                <div class="text-gray-500 text-xs mb-1.5">图标来源</div>
                <div class="flex gap-1 mb-1.5">
                  <button
                    v-for="tab in SOURCE_TABS"
                    :key="tab.key"
                    type="button"
                    class="flex-1 py-1 text-[11px] rounded border transition-colors"
                    :class="form.source === tab.key
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                    @click="onSourceClick(tab.key)"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                <ElInput
                  v-if="form.source === 'url'"
                  v-model="form.icon"
                  placeholder="图标图片 URL"
                  size="small"
                />
                <ElInput
                  v-else-if="form.source === 'text'"
                  v-model="form.iconText"
                  placeholder="显示文字（最多 2 字）"
                  :maxlength="2"
                  size="small"
                />
                <ElButton v-else size="small" class="w-full" @click="uploadIcon">
                  <Icon icon="mdi:upload-outline" class="w-4 h-4 mr-1" />
                  选择图片
                </ElButton>
              </div>

              <!-- 背景色 -->
              <div>
                <div class="text-gray-500 text-xs mb-1.5 flex items-center justify-between">
                  <span>背景色</span>
                  <input
                    type="color"
                    v-model="form.bgColor"
                    class="w-5 h-5 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="c in PRESET_COLORS"
                    :key="c"
                    type="button"
                    class="w-4 h-4 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                    :style="{
                      backgroundColor: c,
                      outline: form.bgColor === c ? '2px solid #888' : 'none',
                      outlineOffset: '1px',
                    }"
                    @click="form.bgColor = c"
                  />
                </div>
              </div>

              <!-- 尺寸 -->
              <div>
                <div class="text-gray-500 text-xs mb-1.5">尺寸</div>
                <div class="flex gap-1 flex-wrap">
                  <button
                    v-for="size in SIZES"
                    :key="size"
                    type="button"
                    class="px-2 py-0.5 text-[11px] rounded border transition-colors"
                    :class="form.size === size
                      ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                    @click="form.size = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- 打开方式 -->
              <div class="flex items-center justify-between">
                <span class="text-gray-500 text-xs">在新标签页打开</span>
                <ElSwitch v-model="form.openInNewTab" size="small" />
              </div>

            </div>
          </div>

          <!-- 底部操作栏 -->
          <div class="flex justify-end gap-2 px-5 py-3 border-t border-black/8">
            <ElButton @click="emit('update:visible', false)">取消</ElButton>
            <ElButton type="primary" @click="save">保存</ElButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
