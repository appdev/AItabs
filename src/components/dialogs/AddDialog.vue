<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useWidgetsStore } from '@/stores/widgets'
import { useIconsStore } from '@/stores/icons'
import { WIDGET_REGISTRY } from '@/stores/widgets'
import { fetchSiteInfo } from '@/services/api'
import { PRESET_COLORS } from '@/utils/color'
import type { WidgetType } from '@/types/widget'

const props = defineProps<{
  visible: boolean
  activeTab?: 'widget' | 'nav' | 'custom'
  editIconId?: string
}>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const widgetsStore = useWidgetsStore()
const iconsStore = useIconsStore()

const currentTab = ref<'widget' | 'nav' | 'custom'>(props.activeTab ?? 'widget')

watch(() => props.activeTab, (tab) => { if (tab) currentTab.value = tab })
watch(() => props.visible, (val) => {
  if (val && props.activeTab) currentTab.value = props.activeTab
  // 编辑模式：打开时预填图标数据
  if (val && props.editIconId) {
    const icon = iconsStore.icons.find(i => i.id === props.editIconId)
    if (icon) {
      customForm.value = {
        url: icon.url,
        name: icon.name,
        icon: icon.icon || '',
        bgColor: icon.bgColor,
        iconMode: icon.iconText ? 'text' : 'image',
        iconText: icon.iconText || '',
      }
    }
  }
  // 新增模式：打开时重置表单
  if (val && !props.editIconId && props.activeTab === 'custom') {
    customForm.value = { url: '', name: '', icon: '', bgColor: '#0984fe', iconMode: 'image', iconText: '' }
    uploadPreviewIcon.value = ''
  }
})

const TABS = [
  { key: 'widget', label: '小组件',   icon: 'mdi:view-grid-plus-outline' },
  { key: 'nav',    label: '网址导航', icon: 'mdi:web' },
  { key: 'custom', label: '自定义图标', icon: 'mdi:plus-circle-outline' },
] as const

// ===== 小组件 Tab =====
const WIDGET_CATEGORIES = ['探索', '全部', '效率', '工具', '开发', '设计', '创意', '娱乐', '其他']
const widgetCategory = ref('全部')
const WIDGET_SORT_OPTIONS = [
  { label: '默认', value: 'default' },
  { label: '今日推荐', value: 'recommended' },
  { label: '最近更新', value: 'updated' },
  { label: '最受欢迎', value: 'popular' },
]
const widgetSort = ref('default')

const filteredWidgets = computed(() => {
  const showAll = widgetCategory.value === '全部' || widgetCategory.value === '探索'
  let list = showAll
    ? [...WIDGET_REGISTRY]
    : WIDGET_REGISTRY.filter(w => w.category === widgetCategory.value)

  if (widgetSort.value === 'popular') {
    list = [...list].sort((a, b) =>
      (WIDGET_INSTALLS[b.type] ?? 0) - (WIDGET_INSTALLS[a.type] ?? 0)
    )
  } else if (widgetSort.value === 'recommended') {
    list = [...list].sort((a, b) => {
      const ai = WIDGET_RECOMMENDED.indexOf(a.type as string)
      const bi = WIDGET_RECOMMENDED.indexOf(b.type as string)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  } else if (widgetSort.value === 'updated') {
    list = [...list].sort((a, b) => {
      const ai = WIDGET_UPDATED.indexOf(a.type as string)
      const bi = WIDGET_UPDATED.indexOf(b.type as string)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }
  return list
})

// 安装量（用于"最受欢迎"排序）
const WIDGET_INSTALLS: Record<string, number> = {
  hotSearch: 312000, weather: 238000, calendar: 186000,
  countdown: 154000, memo: 129000, movie: 87000, anniversary: 73000,
}

// 今日推荐顺序（用于"今日推荐"排序）
const WIDGET_RECOMMENDED = ['weather', 'hotSearch', 'calendar', 'countdown']

// 最近更新顺序（用于"最近更新"排序，靠前的越新）
const WIDGET_UPDATED = ['anniversary', 'memo', 'movie', 'countdown', 'hotSearch', 'calendar', 'weather']

// 尺寸 label 映射
const SIZE_LABEL: Record<string, string> = { '2x2': '2×2', '2x4': '2×4' }

function addWidget(type: WidgetType) {
  widgetsStore.addWidget(type)
  ElMessage.success('已添加')
  emit('update:visible', false)
}

// ===== 网址导航 Tab =====
interface NavSite {
  name: string
  url: string
  icon: string
  bgColor: string
  category: string
  desc: string
}

const NAV_SITES: NavSite[] = [
  // 浏览器
  { name: '百度',       url: 'https://www.baidu.com',             icon: 'https://files.codelife.cc/icons/baidu.svg',    bgColor: '#346efd', category: '浏览器', desc: '全球最大中文搜索引擎' },
  { name: 'Google',     url: 'https://www.google.com',            icon: 'https://files.codelife.cc/icons/google.svg',   bgColor: '#4285f4', category: '浏览器', desc: '全球最大搜索引擎' },
  { name: 'Bing',       url: 'https://www.bing.com',              icon: '',                                              bgColor: '#0078d4', category: '浏览器', desc: '微软旗下搜索引擎' },
  // AI
  { name: 'ChatGPT',   url: 'https://chat.openai.com',           icon: 'https://files.codelife.cc/icons/chatgpt.svg',   bgColor: '#10a37f', category: 'AI',     desc: 'OpenAI 对话式 AI 助手' },
  { name: 'Claude',    url: 'https://claude.ai',                  icon: '',                                              bgColor: '#d97757', category: 'AI',     desc: 'Anthropic 旗下 AI 助手' },
  { name: 'Gemini',    url: 'https://gemini.google.com',          icon: '',                                              bgColor: '#4285f4', category: 'AI',     desc: 'Google Gemini AI 助手' },
  { name: 'DeepSeek',  url: 'https://chat.deepseek.com',          icon: 'https://files.codelife.cc/icons/deepseek.svg',  bgColor: '#1d4ed8', category: 'AI',     desc: '国产高性能 AI 大模型' },
  // 新闻
  { name: '36氪',       url: 'https://36kr.com',                  icon: 'https://files.codelife.cc/icons/36kr.svg',      bgColor: '#eb3333', category: '新闻',   desc: '最新科技创业资讯' },
  { name: '虎嗅',       url: 'https://www.huxiu.com',             icon: 'https://files.codelife.cc/icons/huxiu.svg',     bgColor: '#2196f3', category: '新闻',   desc: '商业科技深度报道' },
  { name: '今日头条',   url: 'https://www.toutiao.com',            icon: 'https://files.codelife.cc/icons/toutiao.svg',   bgColor: '#f04142', category: '新闻',   desc: '个性化推荐阅读' },
  { name: '澎湃新闻',   url: 'https://www.thepaper.cn',            icon: '',                                              bgColor: '#c8102e', category: '新闻',   desc: '新闻原创与聚合平台' },
  // 科技
  { name: 'CSDN',      url: 'https://www.csdn.net',              icon: 'https://files.codelife.cc/icons/csdn.svg',      bgColor: '#c3321f', category: '科技',   desc: '中国最大 IT 技术社区' },
  { name: 'V2EX',      url: 'https://www.v2ex.com',              icon: 'https://files.codelife.cc/icons/v2ex.svg',      bgColor: '#373737', category: '科技',   desc: '创意工作者的社区' },
  { name: '少数派',    url: 'https://sspai.com',                  icon: 'https://files.codelife.cc/icons/sspai.svg',     bgColor: '#d71a1b', category: '科技',   desc: '高品质数字生活指南' },
  // 学习
  { name: 'MDN',       url: 'https://developer.mozilla.org',     icon: '',                                              bgColor: '#000000', category: '学习',   desc: 'Web 开发权威文档' },
  { name: '掘金',      url: 'https://juejin.cn',                  icon: 'https://files.codelife.cc/icons/juejin.svg',   bgColor: '#0984fe', category: '学习',   desc: '面向开发者的技术社区' },
  { name: '阮一峰博客', url: 'https://www.ruanyifeng.com/blog/',  icon: '',                                              bgColor: '#0969da', category: '学习',   desc: '技术与思维的博客' },
  { name: 'Coursera',  url: 'https://www.coursera.org',           icon: '',                                              bgColor: '#0056d2', category: '学习',   desc: '全球顶级在线课程平台' },
  // 阅读
  { name: '知乎',      url: 'https://www.zhihu.com',              icon: 'https://files.codelife.cc/icons/zhihu.svg',    bgColor: '#0066ff', category: '阅读',   desc: '中文互联网高质量问答社区' },
  { name: '豆瓣',      url: 'https://www.douban.com',             icon: 'https://files.codelife.cc/icons/douban.svg',   bgColor: '#00b51d', category: '阅读',   desc: '文艺生活与书影音社区' },
  { name: '微信读书',  url: 'https://weread.qq.com',              icon: '',                                              bgColor: '#1aad19', category: '阅读',   desc: '微信旗下数字阅读平台' },
  // 设计
  { name: 'Figma',     url: 'https://www.figma.com',             icon: 'https://files.codelife.cc/icons/figma.svg',     bgColor: '#f24e1e', category: '设计',   desc: '专业在线 UI 设计工具' },
  { name: 'Unsplash',  url: 'https://unsplash.com',              icon: 'https://files.codelife.cc/icons/unsplash.svg',  bgColor: '#111111', category: '设计',   desc: '免费高清摄影图库' },
  { name: 'ProcessOn', url: 'https://www.processon.com',         icon: 'https://files.codelife.cc/icons/processon.svg', bgColor: '#3b82f6', category: '设计',   desc: '在线绘图与流程图' },
  { name: 'Dribbble',  url: 'https://dribbble.com',              icon: 'https://files.codelife.cc/icons/dribbble.svg',  bgColor: '#ea4c89', category: '设计',   desc: '全球顶级设计师作品社区' },
  // 开发
  { name: 'GitHub',    url: 'https://github.com',                icon: 'https://files.codelife.cc/icons/github.svg',   bgColor: '#333333', category: '开发',   desc: '全球最大代码托管平台' },
  { name: 'Can I Use', url: 'https://caniuse.com',               icon: '',                                              bgColor: '#c6522b', category: '开发',   desc: '浏览器兼容性查询' },
  { name: 'npm',       url: 'https://www.npmjs.com',             icon: '',                                              bgColor: '#cb3837', category: '开发',   desc: 'Node.js 包管理仓库' },
  // 效率
  { name: 'Notion',    url: 'https://www.notion.so',             icon: 'https://files.codelife.cc/icons/notion.svg',   bgColor: '#191919', category: '效率',   desc: '全能型笔记与协作工具' },
  { name: '幕布',      url: 'https://mubu.com',                   icon: '',                                              bgColor: '#ff6f61', category: '效率',   desc: '大纲笔记思维导图' },
  { name: '腾讯文档',  url: 'https://docs.qq.com',                icon: '',                                              bgColor: '#0053d1', category: '效率',   desc: '腾讯在线文档协作' },
  { name: '石墨文档',  url: 'https://shimo.im',                   icon: 'https://files.codelife.cc/icons/shimo.svg',    bgColor: '#2468f2', category: '效率',   desc: '在线协同办公文档' },
  // 工具
  { name: '即刻翻译',  url: 'https://fanyi.baidu.com',            icon: '',                                              bgColor: '#346efd', category: '工具',   desc: '百度在线翻译工具' },
  { name: 'DeepL',     url: 'https://www.deepl.com',             icon: 'https://files.codelife.cc/icons/deepl.svg',    bgColor: '#0f2b46', category: '工具',   desc: '高质量 AI 翻译引擎' },
  // 娱乐
  { name: '哔哩哔哩',  url: 'https://www.bilibili.com',           icon: 'https://files.codelife.cc/icons/bilibili.svg', bgColor: '#01affd', category: '娱乐',   desc: '国内最大弹幕视频网站' },
  { name: '抖音',      url: 'https://www.douyin.com',             icon: 'https://files.codelife.cc/icons/douyin.svg',   bgColor: '#1c0b1a', category: '娱乐',   desc: '中国最大短视频平台' },
  { name: 'YouTube',   url: 'https://www.youtube.com',           icon: 'https://files.codelife.cc/icons/youtube.svg',  bgColor: '#ff0000', category: '娱乐',   desc: '全球最大视频平台' },
  { name: '网易云音乐', url: 'https://music.163.com',             icon: '',                                              bgColor: '#c62f2f', category: '娱乐',   desc: '网易旗下在线音乐平台' },
  // 购物
  { name: '淘宝',      url: 'https://www.taobao.com',             icon: 'https://files.codelife.cc/icons/taobao.svg',   bgColor: '#f52324', category: '购物',   desc: '阿里巴巴旗下购物平台' },
  { name: '京东',      url: 'https://www.jd.com',                 icon: 'https://files.codelife.cc/icons/jd.svg',       bgColor: '#e1251b', category: '购物',   desc: '中国领先的自营电商平台' },
  { name: '天猫',      url: 'https://www.tmall.com',              icon: 'https://files.codelife.cc/icons/tmall.svg',    bgColor: '#ff0030', category: '购物',   desc: '阿里旗下品质购物平台' },
  { name: '拼多多',    url: 'https://www.pinduoduo.com',          icon: 'https://files.codelife.cc/icons/pinduoduo.svg', bgColor: '#e02020', category: '购物',   desc: '亿万用户共同拼购平台' },
  // 社交
  { name: '微博',      url: 'https://weibo.com',                  icon: 'https://files.codelife.cc/icons/weibo.svg',    bgColor: '#e6162d', category: '社交',   desc: '中国最大社交媒体平台' },
  { name: 'X',         url: 'https://x.com',                     icon: 'https://files.codelife.cc/icons/twitter.svg',  bgColor: '#000000', category: '社交',   desc: '全球实时信息社交平台' },
  { name: '微信',      url: 'https://wx.qq.com',                  icon: 'https://files.codelife.cc/icons/wechat.svg',   bgColor: '#07c160', category: '社交',   desc: '微信网页版' },
  { name: '即刻',      url: 'https://web.okjike.com',             icon: 'https://files.codelife.cc/icons/okjike.svg',   bgColor: '#f7b731', category: '社交',   desc: '年轻人的生活圈子' },
  // 金融
  { name: '东方财富',  url: 'https://www.eastmoney.com',          icon: 'https://files.codelife.cc/icons/eastmoney.svg', bgColor: '#e8001a', category: '金融',   desc: '中国领先财经资讯平台' },
  { name: '雪球',      url: 'https://xueqiu.com',                 icon: 'https://files.codelife.cc/icons/xueqiu.svg',   bgColor: '#3b82f6', category: '金融',   desc: '聪明的投资者在雪球' },
  { name: '富途牛牛',  url: 'https://www.futunn.com',             icon: '',                                              bgColor: '#f5a623', category: '金融',   desc: '港美股证券投资平台' },
]

const NAV_CATEGORIES = ['全部', '浏览器', 'AI', '新闻', '科技', '学习', '阅读', '设计', '开发', '效率', '工具', '娱乐', '购物', '社交', '金融', '其他']
const navCategory = ref('全部')
const navSort = ref<'default' | 'recommended' | 'popular'>('default')

// 今日推荐（靠前的优先展示）
const RECOMMENDED_SITES = ['ChatGPT', 'Claude', 'GitHub', '掘金', 'Figma', 'Notion']

// 最受欢迎（靠前的排名更高）
const POPULAR_SITES = ['百度', 'Google', '哔哩哔哩', '微博', '淘宝', '京东', '抖音', '知乎', 'YouTube']

const filteredSites = computed(() => {
  let list = navCategory.value === '全部'
    ? [...NAV_SITES]
    : NAV_SITES.filter(s => s.category === navCategory.value)

  if (navSort.value === 'recommended') {
    list = [...list].sort((a, b) => {
      const ai = RECOMMENDED_SITES.indexOf(a.name)
      const bi = RECOMMENDED_SITES.indexOf(b.name)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  } else if (navSort.value === 'popular') {
    list = [...list].sort((a, b) => {
      const ai = POPULAR_SITES.indexOf(a.name)
      const bi = POPULAR_SITES.indexOf(b.name)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }
  return list
})

function addSite(site: NavSite) {
  iconsStore.addIcon({ name: site.name, url: site.url, icon: site.icon, bgColor: site.bgColor })
  ElMessage.success('已添加')
}

// ===== 自定义图标 Tab =====
const customForm = ref({
  url: '',
  name: '',
  icon: '',
  bgColor: '#0984fe',
  iconMode: 'image' as 'image' | 'upload' | 'text',
  iconText: '',
})
const fetchLoading = ref(false)
const forceRefreshLoading = ref(false)
const uploadInputRef = ref<HTMLInputElement | null>(null)
const uploadPreviewIcon = ref('')

function triggerUpload() {
  uploadInputRef.value?.click()
}

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    uploadPreviewIcon.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function fetchIcon() {
  const url = customForm.value.url.trim()
  if (!url) return
  fetchLoading.value = true
  try {
    const res = await fetchSiteInfo(url)
    if (res.data) {
      customForm.value.name = res.data.name || ''
      customForm.value.icon = res.data.imgSrc || res.data.src || ''
      customForm.value.bgColor = res.data.backgroundColor || '#0984fe'
    } else {
      ElMessage.warning('未能获取网站信息，请手动填写')
    }
  } catch {
    ElMessage.error('获取失败，请检查链接格式')
  } finally {
    fetchLoading.value = false
  }
}

async function forceRefreshIcon() {
  const url = customForm.value.url.trim()
  if (!url) return
  forceRefreshLoading.value = true
  try {
    const res = await fetchSiteInfo(url, true)
    if (res.data) {
      customForm.value.name = res.data.name || customForm.value.name
      customForm.value.icon = res.data.imgSrc || res.data.src || customForm.value.icon
      customForm.value.bgColor = res.data.backgroundColor || customForm.value.bgColor
      ElMessage.success('图标已更新')
    } else {
      ElMessage.warning('未获取到新数据')
    }
  } catch {
    ElMessage.error('刷新失败，请稍后重试')
  } finally {
    forceRefreshLoading.value = false
  }
}

function doSave(): boolean {
  if (!customForm.value.name.trim() || !customForm.value.url.trim()) {
    ElMessage.warning('请填写名称和地址')
    return false
  }
  const isText = customForm.value.iconMode === 'text'
  const isUpload = customForm.value.iconMode === 'upload'
  
  let finalIcon = ''
  if (isUpload) {
    finalIcon = uploadPreviewIcon.value
  } else if (!isText) {
    finalIcon = customForm.value.icon
  }

  const payload = {
    name: customForm.value.name,
    url: customForm.value.url,
    icon: finalIcon,
    iconText: isText ? (customForm.value.iconText.trim() || undefined) : undefined,
    bgColor: customForm.value.bgColor,
  }
  if (props.editIconId) {
    iconsStore.updateIcon(props.editIconId, payload)
  } else {
    iconsStore.addIcon(payload)
  }
  return true
}

function saveIcon() {
  if (doSave()) emit('update:visible', false)
}

function saveAndContinue() {
  if (!doSave()) return
  ElMessage.success('添加成功')
  customForm.value = { url: '', name: '', icon: '', bgColor: '#0984fe', iconMode: 'image', iconText: '' }
  uploadPreviewIcon.value = ''
  if (uploadInputRef.value) uploadInputRef.value.value = ''
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[200] flex items-center justify-center p-6"
        @click.self="emit('update:visible', false)"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40" @click="emit('update:visible', false)" />

        <!-- 弹窗主体 -->
        <div
          class="relative glass-dialog rounded-2xl overflow-hidden flex"
          style="width: 80vw; max-width: 960px; height: 70vh;"
        >
          <!-- 左侧 Tab 栏（编辑图标模式下隐藏） -->
          <nav v-if="!editIconId" class="flex flex-col gap-1 p-3 border-r border-black/8 dark:border-white/10 flex-shrink-0" style="width: 120px;">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              type="button"
              class="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors"
              :class="currentTab === tab.key ? 'bg-black/8 dark:bg-white/10 text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white'"
              @click="currentTab = tab.key"
            >
              <Icon :icon="tab.icon" class="w-6 h-6" />
              <span class="text-[11px] leading-tight text-center">{{ tab.label }}</span>
            </button>
          </nav>

          <!-- 右侧内容区 -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- 顶部标题栏 -->
            <div class="flex items-center justify-between px-5 py-3 border-b border-black/8 dark:border-white/10 flex-shrink-0">
              <h2 class="text-gray-800 dark:text-white font-medium">
                {{ editIconId && currentTab === 'custom' ? '编辑图标' : TABS.find(t => t.key === currentTab)?.label }}
              </h2>
              <button
                type="button"
                class="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                @click="emit('update:visible', false)"
              >
                <Icon icon="mdi:close" class="w-5 h-5" />
              </button>
            </div>

            <!-- ===== 小组件 Tab ===== -->
            <template v-if="currentTab === 'widget'">
              <!-- 分类筛选 -->
              <div class="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-black/8 dark:border-white/10 flex-shrink-0">
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="cat in WIDGET_CATEGORIES"
                    :key="cat"
                    type="button"
                    class="px-3 py-1 rounded-full text-xs transition-colors"
                    :class="widgetCategory === cat ? 'bg-blue-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/8 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white'"
                    @click="widgetCategory = cat"
                  >{{ cat }}</button>
                </div>
                <div class="flex rounded-lg overflow-hidden border border-black/10 dark:border-white/10 text-xs flex-shrink-0">
                  <button
                    v-for="opt in WIDGET_SORT_OPTIONS"
                    :key="opt.value"
                    type="button"
                    class="px-2.5 py-1 transition-colors"
                    :class="widgetSort === opt.value ? 'bg-black/8 dark:bg-white/10 text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'"
                    @click="widgetSort = opt.value"
                  >{{ opt.label }}</button>
                </div>
              </div>
              <!-- 卡片网格 -->
              <div class="flex-1 overflow-y-auto p-5">
                <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <div
                    v-for="widget in filteredWidgets"
                    :key="widget.type"
                    class="glass-card rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/80 to-blue-600/80 flex items-center justify-center flex-shrink-0">
                        <Icon :icon="widget.icon" class="w-5 h-5 text-white" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ widget.name }}</span>
                          <span class="text-[10px] text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{{ SIZE_LABEL[widget.defaultSize] ?? widget.defaultSize }}</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ widget.description }}</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] text-gray-400 dark:text-gray-500">
                        <Icon icon="mdi:download-outline" class="w-3 h-3 inline mr-0.5" />
                        {{ WIDGET_INSTALLS[widget.type] ?? '-' }}
                      </span>
                      <button
                        type="button"
                        class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                        @click="addWidget(widget.type)"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ===== 网址导航 Tab ===== -->
            <template v-else-if="currentTab === 'nav'">
              <!-- 分类筛选 + 排序 -->
              <div class="flex items-start gap-2 px-5 py-2.5 border-b border-black/8 dark:border-white/10 flex-shrink-0">
                <div class="flex gap-1.5 flex-wrap flex-1">
                  <button
                    v-for="cat in NAV_CATEGORIES"
                    :key="cat"
                    type="button"
                    class="px-3 py-1 rounded-full text-xs transition-colors"
                    :class="navCategory === cat ? 'bg-blue-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/8 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white'"
                    @click="navCategory = cat"
                  >{{ cat }}</button>
                </div>
                <div class="flex rounded-lg overflow-hidden border border-black/10 dark:border-white/10 text-xs flex-shrink-0 mt-0.5">
                  <button
                    v-for="opt in [{ label: '默认', value: 'default' }, { label: '今日推荐', value: 'recommended' }, { label: '最受欢迎', value: 'popular' }]"
                    :key="opt.value"
                    type="button"
                    class="px-2.5 py-1 transition-colors"
                    :class="navSort === opt.value ? 'bg-black/8 dark:bg-white/10 text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'"
                    @click="navSort = opt.value as 'default' | 'recommended' | 'popular'"
                  >{{ opt.label }}</button>
                </div>
              </div>
              <!-- 站点卡片 -->
              <div class="flex-1 overflow-y-auto p-5">
                <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <div
                    v-for="site in filteredSites"
                    :key="site.url"
                    class="glass-card rounded-xl p-3 flex items-center gap-3 group/card"
                  >
                    <!-- 图标 -->
                    <div
                      class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                      :style="{ backgroundColor: site.bgColor }"
                    >
                      <img v-if="site.icon" :src="site.icon" :alt="site.name" class="w-6 h-6 object-contain" />
                      <span v-else class="text-white font-bold text-sm">{{ site.name.charAt(0) }}</span>
                    </div>
                    <!-- 名称 + 描述 -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ site.name }}</p>
                        <!-- 外链图标 -->
                        <a
                          :href="site.url"
                          target="_blank"
                          rel="noopener"
                          class="text-gray-300 dark:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 transition-colors opacity-0 group-hover/card:opacity-100 flex-shrink-0"
                          title="在新标签页打开"
                          @click.stop
                        >
                          <Icon icon="mdi:open-in-new" class="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ site.desc }}</p>
                    </div>
                    <!-- 添加按钮 -->
                    <button
                      type="button"
                      class="px-2.5 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex-shrink-0"
                      @click="addSite(site)"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- ===== 自定义图标 Tab ===== -->
            <template v-else-if="currentTab === 'custom'">
              <div class="flex-1 overflow-y-auto">
                <div class="flex h-full">
                  <!-- 表单区 -->
                  <div class="flex-1 p-5 space-y-4">
                    <!-- URL 输入 -->
                    <div>
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">网址</label>
                      <div class="flex gap-2">
                        <ElInput
                          v-model="customForm.url"
                          placeholder="https://example.com"
                          size="default"
                          clearable
                          class="dark-input"
                          @keyup.enter="fetchIcon"
                        />
                        <ElButton
                          type="primary"
                          size="default"
                          :loading="fetchLoading"
                          @click="fetchIcon"
                        >
                          获取图标
                        </ElButton>
                        <ElButton
                          type="warning"
                          size="default"
                          :loading="forceRefreshLoading"
                          :disabled="!customForm.url"
                          @click="forceRefreshIcon"
                        >
                          强制刷新
                        </ElButton>
                      </div>
                    </div>

                    <!-- 名称 -->
                    <div>
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">名称</label>
                      <ElInput v-model="customForm.name" placeholder="网站名称" size="default" class="dark-input" />
                    </div>

                    <!-- 图标颜色 -->
                    <div>
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">图标颜色</label>
                      <div class="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 custom-scrollbar">
                        <button
                          v-for="c in PRESET_COLORS"
                          :key="c"
                          class="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110 relative"
                          :style="{ backgroundColor: c }"
                          @click="customForm.bgColor = c"
                        >
                          <Icon 
                            v-if="customForm.bgColor === c" 
                            icon="mdi:check" 
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white" 
                          />
                        </button>
                        <div class="relative w-5 h-5 flex-shrink-0 rounded-full overflow-hidden" :class="{'ring-2 ring-black/40 dark:ring-white/40 ring-offset-1': !PRESET_COLORS.includes(customForm.bgColor)}">
                          <input
                            type="color"
                            v-model="customForm.bgColor"
                            class="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                            title="自定义颜色"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- 图标模式切换 -->
                    <div class="flex gap-4">
                        <!-- 左侧模式选择 -->
                        <div class="flex gap-4 mt-2">
                          <div class="flex flex-col items-center gap-2">
                            <button
                              type="button"
                              class="w-[68px] h-[68px] rounded-[18px] flex items-center justify-center transition-all relative"
                              :class="customForm.iconMode === 'text' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'hover:ring-2 hover:ring-black/10 dark:hover:ring-white/20 hover:ring-offset-2 dark:hover:ring-offset-gray-900'"
                              :style="{ backgroundColor: customForm.bgColor }"
                              @click="customForm.iconMode = 'text'"
                            >
                              <span class="text-white font-medium text-xl select-none px-1 overflow-hidden truncate max-w-full" :style="{ fontSize: (customForm.iconText || customForm.name).length > 2 ? '14px' : '20px' }">{{ customForm.iconText ? customForm.iconText : (customForm.name ? customForm.name : '文字') }}</span>
                              <div v-if="customForm.iconMode === 'text'" class="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-[2px] border-white dark:border-gray-800 shadow-sm z-10">
                                <Icon icon="mdi:check" class="w-3 h-3 text-white" />
                              </div>
                            </button>
                            <span class="text-xs text-gray-500 dark:text-gray-400">文字图标</span>
                          </div>
                          
                          <div class="flex flex-col items-center gap-2" v-if="customForm.icon">
                            <button
                              type="button"
                              class="w-[68px] h-[68px] rounded-[18px] flex items-center justify-center transition-all relative"
                              :class="customForm.iconMode === 'image' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'hover:ring-2 hover:ring-black/10 dark:hover:ring-white/20 hover:ring-offset-2 dark:hover:ring-offset-gray-900'"
                              :style="{ backgroundColor: customForm.bgColor }"
                              @click="customForm.iconMode = 'image'"
                            >
                            <img :src="customForm.icon" class="w-full h-full object-cover rounded-[18px]" />
                            
                            <div v-if="customForm.iconMode === 'image'" class="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-[2px] border-white dark:border-gray-800 shadow-sm z-10">
                              <Icon icon="mdi:check" class="w-3 h-3 text-white" />
                            </div>
                            </button>
                            <span class="text-xs text-gray-500 dark:text-gray-400">图标</span>
                          </div>

                          <div class="flex flex-col items-center gap-2">
                            <button
                              type="button"
                              class="w-[68px] h-[68px] rounded-[18px] flex items-center justify-center transition-all relative"
                              :class="[
                                customForm.iconMode === 'upload' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'hover:ring-2 hover:ring-black/10 dark:hover:ring-white/20 hover:ring-offset-2 dark:hover:ring-offset-gray-900',
                                !uploadPreviewIcon ? 'bg-black/5 dark:bg-white/5' : ''
                              ]"
                              :style="{ backgroundColor: uploadPreviewIcon ? customForm.bgColor : '' }"
                              @click="customForm.iconMode = 'upload'"
                            >
                              <img v-if="uploadPreviewIcon" :src="uploadPreviewIcon" class="w-full h-full object-cover rounded-[18px]" />
                              <Icon v-else icon="mdi:plus" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
                              
                              <div v-if="customForm.iconMode === 'upload'" class="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-[2px] border-white dark:border-gray-800 shadow-sm z-10">
                                <Icon icon="mdi:check" class="w-3 h-3 text-white" />
                              </div>
                            </button>
                            <span class="text-xs text-gray-500 dark:text-gray-400">上传</span>
                          </div>
                      </div>
                    </div>

                    <!-- 上传图片（upload 模式） -->
                    <div v-if="customForm.iconMode === 'upload'" class="mt-4">
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">上传图片（PNG / JPG / SVG，≤ 2MB）</label>
                      <input
                        ref="uploadInputRef"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileUpload"
                      />
                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          class="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs transition-colors flex items-center gap-1.5"
                          @click="triggerUpload"
                        >
                          <Icon icon="mdi:upload" class="w-4 h-4" />
                          选择图片
                        </button>
                        <span v-if="uploadPreviewIcon" class="text-green-500 dark:text-green-400 text-xs flex items-center gap-1">
                          <Icon icon="mdi:check-circle" class="w-3.5 h-3.5" />
                          已选择
                        </span>
                        <span v-else class="text-gray-400 dark:text-gray-500 text-xs">未选择</span>
                      </div>
                    </div>

                    <!-- 图标文字（文字模式） -->
                    <div v-if="customForm.iconMode === 'text'" class="mt-4">
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">图标文字（留空使用名称首字母）</label>
                      <div class="relative">
                        <ElInput
                          v-model="customForm.iconText"
                          placeholder="如：AI、云、V"
                          size="default"
                          class="dark-input"
                        />
                      </div>
                    </div>

                    <!-- 图标 URL（图片 URL 模式） -->
                    <div v-if="customForm.iconMode === 'image'" class="mt-4">
                      <label class="text-gray-600 dark:text-gray-400 text-xs block mb-1.5">图标 URL（选填，自动获取或留空使用首字母）</label>
                      <ElInput v-model="customForm.icon" placeholder="https://..." size="default" clearable class="dark-input" />
                    </div>

                    <!-- 操作按钮 -->
                    <div class="flex gap-2 pt-2">
                      <ElButton type="primary" @click="saveIcon">{{ editIconId ? '保存修改' : '保存' }}</ElButton>
                      <ElButton v-if="!editIconId" class="dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20" @click="saveAndContinue">保存并继续</ElButton>
                    </div>
                  </div>

                  <!-- 右侧预览区已移除 -->
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
