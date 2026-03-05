<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useWidgetsStore } from '@/stores/widgets'
import type { Widget } from '@/types/widget'

const { showWidgetConfig, configuringWidgetId } = useContextMenu()
const widgetsStore = useWidgetsStore()

const widget = computed<Widget | undefined>(() =>
  widgetsStore.widgets.find(w => w.id === configuringWidgetId.value)
)

// ---- 各组件独立配置草稿 ----
const weatherForm = ref({ city: '', unit: 'celsius' as 'celsius' | 'fahrenheit' })
const countdownForm = ref({ offWork: '18:00', salary: 10000, payDay: 10 })
const anniversaryForm = ref({ title: '你在世界已经', startDate: '1997-10-01' })
const memoForm = ref({ content: '' })

// 打开时同步 config → 草稿
watch(showWidgetConfig, (open) => {
  if (!open || !widget.value) return
  const c = widget.value.config
  const t = widget.value.type

  if (t === 'weather') {
    weatherForm.value = {
      city: (c.city as string) ?? '',
      unit: (c.unit as 'celsius' | 'fahrenheit') ?? 'celsius',
    }
  } else if (t === 'countdown') {
    countdownForm.value = {
      offWork: (c.offWork as string) ?? '18:00',
      salary: (c.salary as number) ?? 10000,
      payDay: (c.payDay as number) ?? 10,
    }
  } else if (t === 'anniversary') {
    anniversaryForm.value = {
      title: (c.title as string) ?? '你在世界已经',
      startDate: (c.startDate as string) ?? '1997-10-01',
    }
  } else if (t === 'memo') {
    memoForm.value = { content: (c.content as string) ?? '' }
  }
})

function save() {
  const id = configuringWidgetId.value
  if (!id || !widget.value) return

  const t = widget.value.type
  let newConfig: Record<string, unknown> = {}

  if (t === 'weather') {
    newConfig = { ...widget.value.config, ...weatherForm.value }
  } else if (t === 'countdown') {
    newConfig = { ...widget.value.config, ...countdownForm.value }
  } else if (t === 'anniversary') {
    newConfig = { ...widget.value.config, ...anniversaryForm.value }
  } else if (t === 'memo') {
    newConfig = { ...widget.value.config, ...memoForm.value }
  }

  widgetsStore.updateWidget(id, { config: newConfig })
  showWidgetConfig.value = false
}

const WIDGET_TITLES: Record<string, string> = {
  weather: '天气设置',
  countdown: '下班倒计时设置',
  anniversary: '纪念日设置',
  memo: '备忘录设置',
  calendar: '日历设置',
  hotSearch: '热搜榜设置',
  movie: '电影日历设置',
}
const dialogTitle = computed(() => WIDGET_TITLES[widget.value?.type ?? ''] ?? '组件设置')
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="showWidgetConfig && widget"
        class="fixed inset-0 z-[900] flex items-center justify-center"
        @click.self="showWidgetConfig = false"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showWidgetConfig = false" />

        <!-- 弹窗主体 -->
        <div class="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span class="text-white font-medium text-sm">{{ dialogTitle }}</span>
            <button
              type="button"
              class="text-white/50 hover:text-white/80 transition-colors"
              @click="showWidgetConfig = false"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="px-5 py-4 space-y-4">

            <!-- ===== 天气 ===== -->
            <template v-if="widget.type === 'weather'">
              <div class="space-y-3">
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">城市（留空则自动定位）</label>
                  <input
                    v-model="weatherForm.city"
                    type="text"
                    placeholder="例如：北京、Shanghai"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <p class="text-white/30 text-[11px] mt-1">支持中文城市名或英文名</p>
                </div>
                <div>
                  <label class="block text-white/60 text-xs mb-2">温度单位</label>
                  <div class="flex gap-2">
                    <button
                      v-for="opt in [{ value: 'celsius', label: '摄氏度 °C' }, { value: 'fahrenheit', label: '华氏度 °F' }]"
                      :key="opt.value"
                      type="button"
                      class="flex-1 py-2 rounded-lg text-sm transition-colors"
                      :class="weatherForm.unit === opt.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'"
                      @click="weatherForm.unit = (opt.value === 'fahrenheit' ? 'fahrenheit' : 'celsius')"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- ===== 下班倒计时 ===== -->
            <template v-else-if="widget.type === 'countdown'">
              <div class="space-y-3">
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">下班时间</label>
                  <input
                    v-model="countdownForm.offWork"
                    type="time"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">月薪（元）</label>
                  <input
                    v-model.number="countdownForm.salary"
                    type="number"
                    min="0"
                    step="100"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <p class="text-white/30 text-[11px] mt-1">用于计算今日已赚金额</p>
                </div>
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">发薪日（每月几号）</label>
                  <input
                    v-model.number="countdownForm.payDay"
                    type="number"
                    min="1"
                    max="28"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
              </div>
            </template>

            <!-- ===== 纪念日 ===== -->
            <template v-else-if="widget.type === 'anniversary'">
              <div class="space-y-3">
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">标题</label>
                  <input
                    v-model="anniversaryForm.title"
                    type="text"
                    placeholder="例如：你在世界已经"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-white/60 text-xs mb-1.5">起始日期</label>
                  <input
                    v-model="anniversaryForm.startDate"
                    type="date"
                    class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-white/30 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </template>

            <!-- ===== 备忘录 ===== -->
            <template v-else-if="widget.type === 'memo'">
              <div>
                <label class="block text-white/60 text-xs mb-1.5">内容预览</label>
                <textarea
                  v-model="memoForm.content"
                  rows="6"
                  placeholder="点击直接在组件上输入..."
                  class="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 transition-all resize-none leading-relaxed"
                />
                <p class="text-white/30 text-[11px] mt-1">也可直接在桌面组件上点击输入</p>
              </div>
            </template>

            <!-- ===== 无配置项的组件 ===== -->
            <template v-else>
              <div class="text-center py-6 text-white/40">
                <Icon icon="mdi:information-outline" class="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p class="text-sm">该组件暂无可配置选项</p>
              </div>
            </template>

          </div>

          <!-- 底部按钮 -->
          <div class="flex gap-3 px-5 pb-5">
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
              @click="showWidgetConfig = false"
            >
              取消
            </button>
            <button
              v-if="widget.type !== 'calendar' && widget.type !== 'hotSearch' && widget.type !== 'movie'"
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors font-medium"
              @click="save"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-active .relative,
.dialog-fade-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
