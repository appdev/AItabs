<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import type { SiteIcon } from '@/types/icon'

const props = defineProps<{
  visible: boolean
  icon: SiteIcon
  trigger?: HTMLElement | null
}>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const settingsStore = useSettingsStore()

// 计算 popover 位置：显示在触发元素正上方，水平居中
const popoverStyle = ref<Record<string, string>>({})

watch(
  () => props.visible,
  (val) => {
    if (!val || !props.trigger) return
    const rect = props.trigger.getBoundingClientRect()
    const popoverWidth = 300
    // 水平居中对齐触发元素，保持在视口内
    let left = rect.left + rect.width / 2 - popoverWidth / 2
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8))
    // 优先显示在上方，空间不足则显示在下方
    const spaceAbove = rect.top - 8
    const popoverHeight = 240 // 估算高度
    const showAbove = spaceAbove >= popoverHeight
    const top = showAbove
      ? rect.top - popoverHeight - 8
      : rect.bottom + 8
    popoverStyle.value = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${popoverWidth}px`,
    }
  },
)

function openItem(child: SiteIcon) {
  if (!child.url) return
  const blank = child.openInNewTab ?? settingsStore.settings.open.iconBlank
  window.open(child.url, blank ? '_blank' : '_self')
  emit('update:visible', false)
}

const hasChildren = computed(() => (props.icon.children?.length ?? 0) > 0)
</script>

<template>
  <Teleport to="body">
    <Transition name="folder-pop">
      <div
        v-if="visible"
        class="fixed inset-0 z-[300]"
        @click.self="emit('update:visible', false)"
      >
        <!-- 透明遮罩，点击外部关闭 -->
        <div class="absolute inset-0" @click="emit('update:visible', false)" />

        <!-- Popover 主体 -->
        <div
          class="absolute glass-card rounded-2xl p-4 shadow-2xl"
          :style="popoverStyle"
          @click.stop
        >
          <!-- 标题栏 -->
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-800 font-medium text-sm">{{ icon.name }}</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700 transition-colors"
              @click="emit('update:visible', false)"
            >
              <Icon icon="mdi:close" class="w-4 h-4" />
            </button>
          </div>

          <!-- 子图标网格 -->
          <div v-if="hasChildren" class="grid grid-cols-4 gap-3">
            <button
              v-for="child in icon.children"
              :key="child.id"
              type="button"
              class="flex flex-col items-center gap-1 group"
              @click="openItem(child)"
            >
              <div
                class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
                :style="{ backgroundColor: child.bgColor }"
              >
                <img
                  v-if="child.icon"
                  :src="child.icon"
                  :alt="child.name"
                  class="w-[60%] h-[60%] object-contain"
                />
                <span v-else class="text-white font-bold text-lg select-none truncate max-w-full px-1" :style="{ fontSize: (child.iconText || child.name).length > 2 ? '12px' : '18px' }">
                  {{ child.iconText || child.name || '?' }}
                </span>
              </div>
              <span class="text-[10px] text-gray-600 truncate max-w-full text-center leading-tight">
                {{ child.name }}
              </span>
            </button>
          </div>

          <!-- 空文件夹提示 -->
          <p v-else class="text-gray-400 text-xs text-center py-4">
            文件夹为空
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.folder-pop-enter-active,
.folder-pop-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.folder-pop-enter-from,
.folder-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
