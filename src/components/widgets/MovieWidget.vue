<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import type { Widget } from '@/types/widget'

defineProps<{ widget: Widget }>()

// 7 部经典电影，按星期几（0=周日 ... 6=周六）轮换
// poster 使用 TMDB 海报图片，加载失败时降级到 fallbackGradient
const MOVIES = [
  {
    title: '霸王别姬',
    rating: '9.6',
    quote: '说好了一辈子，差一年、一个月、一天都不算。',
    poster: 'https://image.tmdb.org/t/p/w500/1rY7p49skzNcTZC1cVXqpKJI9bx.jpg',
    fallbackGradient: 'from-red-800 via-red-600 to-orange-700',
  },
  {
    title: '活着',
    rating: '9.3',
    quote: '日子是要一天一天过的，不能一下子过太多。',
    poster: 'https://image.tmdb.org/t/p/w500/hSaH9tt67bozo9K50sbH0s4YjEc.jpg',
    fallbackGradient: 'from-yellow-800 via-amber-700 to-yellow-600',
  },
  {
    title: '大话西游',
    rating: '9.1',
    quote: '曾经有一份真诚的爱情放在我面前，我没有珍惜。',
    poster: 'https://image.tmdb.org/t/p/w500/yx23Yiuvn9BpS2skn7kBi3S5QIF.jpg',
    fallbackGradient: 'from-indigo-800 via-purple-700 to-violet-600',
  },
  {
    title: '功夫',
    rating: '8.7',
    quote: '做人如果无梦想，跟咸鱼有什么分别？',
    poster: 'https://image.tmdb.org/t/p/w500/a7eKZMnDnxJi8XNW2Fy1GbEFO8i.jpg',
    fallbackGradient: 'from-yellow-600 via-orange-500 to-red-600',
  },
  {
    title: '辛德勒的名单',
    rating: '9.5',
    quote: '凡救一命，即救全世界。',
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    fallbackGradient: 'from-gray-800 via-gray-700 to-slate-600',
  },
  {
    title: '肖申克的救赎',
    rating: '9.7',
    quote: '有些鸟是关不住的，因为每片羽毛都闪耀着自由的光辉。',
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bAY74W56MAn3F2Gq.jpg',
    fallbackGradient: 'from-blue-900 via-blue-700 to-cyan-600',
  },
  {
    title: '星际穿越',
    rating: '9.4',
    quote: '爱是唯一能够超越时间和空间的力量。',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    fallbackGradient: 'from-slate-900 via-blue-900 to-indigo-800',
  },
]

const today = dayjs()
const movie = computed(() => MOVIES[today.day()]!)
const dateNum = today.date()
const monthWeek = `${today.month() + 1}月 / ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.day()]}`

// 海报加载失败时切换到渐变背景
import { ref } from 'vue'
const posterFailed = ref(false)
</script>

<template>
  <div
    class="w-full h-full relative overflow-hidden flex flex-col select-none"
    :class="posterFailed ? `bg-gradient-to-br ${movie.fallbackGradient}` : 'bg-gray-900'"
  >
    <!-- 海报背景（background-image cover） -->
    <div
      v-if="!posterFailed"
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url('${movie.poster}')` }"
    >
      <!-- 用 img 标签探测加载失败 -->
      <img
        :src="movie.poster"
        class="hidden"
        alt=""
        @error="posterFailed = true"
      />
    </div>

    <!-- 从底部到中部的渐变遮罩 -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

    <!-- 左上角：日期 -->
    <div class="relative z-10 p-2.5">
      <div class="text-white text-xl font-bold leading-none drop-shadow">{{ dateNum }}</div>
      <div class="text-white/70 text-[10px] mt-0.5 drop-shadow">{{ monthWeek }}</div>
    </div>

    <!-- 底部：电影信息 -->
    <div class="relative z-10 mt-auto p-2.5 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="text-white text-xs font-semibold truncate drop-shadow">{{ movie.title }}</span>
        <span class="flex-shrink-0 text-yellow-400 text-[10px] bg-black/40 rounded px-1 py-0.5">
          ★ {{ movie.rating }}
        </span>
      </div>
      <p class="text-white/70 text-[10px] leading-tight line-clamp-2 drop-shadow">{{ movie.quote }}</p>
    </div>
  </div>
</template>
