<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Widget } from '@/types/widget'

defineProps<{ widget: Widget }>()

type Source = 'baidu' | 'weibo' | 'douyin'

const CACHE_KEY_PREFIX = 'aitabs-hotsearch-'
const CACHE_TTL = 10 * 60 * 1000

const active = ref<Source>('baidu')

const TABS: { key: Source; label: string; color: string }[] = [
  { key: 'baidu', label: '百度', color: '#346efd' },
  { key: 'weibo', label: '微博', color: '#e6162d' },
  { key: 'douyin', label: '抖音', color: '#fe2c55' },
]

type HotItem = { title: string; heat: string }

// Mock 数据（对接真实 API 后只需替换此处）
const MOCK_DATA: Record<Source, HotItem[]> = {
  baidu: [
    { title: 'DeepSeek R2 正式发布', heat: '892.3万' },
    { title: '国产芯片取得重大突破', heat: '781.0万' },
    { title: '新能源汽车销量创历史新高', heat: '654.2万' },
    { title: '全国多地出现强降雪天气', heat: '521.6万' },
    { title: 'AI 绘画工具全面升级', heat: '487.9万' },
    { title: '高考报名截止时间提醒', heat: '432.1万' },
    { title: '某明星宣布官宣婚讯', heat: '398.5万' },
    { title: '北京今日全市交通管制', heat: '376.3万' },
    { title: '国际油价大幅波动影响分析', heat: '312.8万' },
    { title: '某上市公司发布年度财报', heat: '287.4万' },
    { title: '医疗改革新政策正式出台', heat: '265.0万' },
    { title: '教育部发布新一轮改革规定', heat: '243.7万' },
    { title: '某城市正式推广数字人民币', heat: '198.2万' },
    { title: '全国楼市调控政策最新动态', heat: '176.5万' },
    { title: '2026 年世界杯预选赛结果', heat: '154.3万' },
    { title: '某省出台人才引进新政策', heat: '132.8万' },
    { title: '网络安全新规今日正式实施', heat: '118.4万' },
    { title: '某综艺节目播出引发热议', heat: '97.6万' },
    { title: 'ChatGPT 发布重大功能更新', heat: '86.1万' },
    { title: '新一轮降温来袭注意防寒保暖', heat: '74.9万' },
  ],
  weibo: [
    { title: '某顶流明星新专辑今日发布', heat: '956.1万' },
    { title: '热播剧大结局今晚播出', heat: '843.7万' },
    { title: '某运动员破个人世界纪录', heat: '712.4万' },
    { title: '某知名博主宣布停更原因', heat: '634.8万' },
    { title: '网红美食探店翻车事件始末', heat: '589.3万' },
    { title: 'XX 综艺节目官宣全新阵容', heat: '521.7万' },
    { title: '某品牌因广告被网友抵制', heat: '476.2万' },
    { title: '某演员被曝恋情疑似实锤', heat: '432.9万' },
    { title: '热播电视剧收视率再创新高', heat: '387.4万' },
    { title: '某博主直播时突发意外引关注', heat: '356.1万' },
    { title: '明星公益活动现场曝光', heat: '321.8万' },
    { title: '某歌手新单曲今日首发', heat: '287.4万' },
    { title: '某网络事件核心人物公开发声', heat: '265.0万' },
    { title: '某知名作家新书发布会现场', heat: '243.7万' },
    { title: '某剧爆冷拿下行业大奖', heat: '218.5万' },
    { title: '某运动队获得世界冠军', heat: '187.9万' },
    { title: '某艺人直播带货数据造假疑云', heat: '165.4万' },
    { title: '某情侣官宣分手粉丝叹惋', heat: '143.8万' },
    { title: '某博主晒出豪华婚礼照片', heat: '121.3万' },
    { title: '某影视剧剧情引发大量争议', heat: '98.7万' },
  ],
  douyin: [
    { title: '这个滤镜全网都在模仿', heat: '1023.5万' },
    { title: '神还原某电影经典场景', heat: '876.4万' },
    { title: '东北大叔魔性舞蹈意外走红', heat: '745.2万' },
    { title: '超简单家庭健身教程合集', heat: '612.8万' },
    { title: '某城市必吃宝藏小吃推荐', heat: '589.3万' },
    { title: '年轻人最爱咖啡的打开方式', heat: '534.7万' },
    { title: '爸爸给女儿准备的生日惊喜', heat: '476.1万' },
    { title: '治愈系早餐日常记录', heat: '432.8万' },
    { title: '解压神器开箱真实测评', heat: '398.4万' },
    { title: '深夜食堂感人情感故事', heat: '356.7万' },
    { title: '某县城浪漫婚礼感动全网', heat: '321.5万' },
    { title: '零基础学做一道硬菜', heat: '287.9万' },
    { title: '宝藏景点安利给你们', heat: '254.3万' },
    { title: '小孩的脑洞想法太厉害了', heat: '218.8万' },
    { title: '遛弯时偶遇神奇动物', heat: '187.4万' },
    { title: '这条公路风景燃爆了', heat: '165.2万' },
    { title: '某广场舞大妈走红海外', heat: '143.6万' },
    { title: '人均 CEO 的打工日常', heat: '121.9万' },
    { title: '某地方言挑战来了你会吗', heat: '98.7万' },
    { title: '这颜值让网友纷纷沦陷', heat: '76.4万' },
  ],
}

const lists = ref<Record<Source, HotItem[]>>({ baidu: [], weibo: [], douyin: [] })

// 从缓存读取，若过期则重新"获取"（目前使用 mock，后续可替换为真实 API）
function loadSource(source: Source) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + source)
    if (raw) {
      const { data, timestamp }: { data: HotItem[]; timestamp: number } = JSON.parse(raw)
      if (Date.now() - timestamp < CACHE_TTL) {
        lists.value[source] = data
        return
      }
    }
  } catch { /* 缓存损坏，重新加载 */ }

  // 目前直接使用 mock 数据并写入缓存
  lists.value[source] = MOCK_DATA[source]
  localStorage.setItem(
    CACHE_KEY_PREFIX + source,
    JSON.stringify({ data: MOCK_DATA[source], timestamp: Date.now() }),
  )
}

onMounted(() => {
  // 预加载当前激活源，其余两个延迟加载
  loadSource('baidu')
  loadSource('weibo')
  loadSource('douyin')
})

function rankColor(rank: number): string {
  if (rank === 1) return '#ff4444'
  if (rank === 2) return '#ff8800'
  if (rank === 3) return '#ffcc00'
  return '#999999'
}

const SEARCH_URLS: Record<Source, string> = {
  baidu: 'https://www.baidu.com/s?wd=',
  weibo: 'https://s.weibo.com/weibo?q=',
  douyin: 'https://www.douyin.com/search/',
}

function handleClick(title: string) {
  window.open(SEARCH_URLS[active.value] + encodeURIComponent(title), '_blank')
}
</script>

<template>
  <div class="w-full h-full bg-white/85 backdrop-blur-sm flex flex-col overflow-hidden select-none">

    <!-- 顶部标签栏 -->
    <div class="flex items-center gap-0.5 px-2 pt-2 pb-1 flex-shrink-0">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        class="px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
        :style="active === tab.key ? { backgroundColor: tab.color, color: '#fff' } : {}"
        :class="active !== tab.key ? 'text-gray-500 hover:bg-gray-100' : ''"
        @click="active = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 列表 -->
    <div class="flex-1 overflow-y-auto px-2 pb-1">
      <button
        v-for="(item, idx) in lists[active]"
        :key="idx"
        type="button"
        class="w-full flex items-center gap-1.5 py-[3px] text-left hover:bg-gray-50 rounded transition-colors group"
        @click="handleClick(item.title)"
      >
        <span
          class="text-[11px] font-bold tabular-nums w-4 flex-shrink-0 text-right leading-none"
          :style="{ color: rankColor(idx + 1) }"
        >
          {{ idx + 1 }}
        </span>
        <span class="flex-1 text-[11px] text-gray-700 truncate group-hover:text-blue-600 transition-colors">
          {{ item.title }}
        </span>
        <span class="text-[10px] text-gray-400 flex-shrink-0">{{ item.heat }}</span>
      </button>
    </div>

  </div>
</template>
