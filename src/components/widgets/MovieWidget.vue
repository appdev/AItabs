<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { useMovieDetailDialog } from '@/composables/useMovieDetailDialog'
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
    genre: '剧情/爱情/历史',
    year: '1993',
    country: '中国大陆/中国香港',
    director: '陈凯歌',
    summary: '段小楼（张丰毅）与程蝶衣（张国荣）是一对打小一起长大的师兄弟，两人一个演生，一个饰旦，一向配合天衣无缝，尤其一出《霸王别姬》，更是誉满京城，为此，两人约定合演一辈子《霸王别姬》。但两人对戏剧与人生关系的理解有本质不同，段小楼深知戏非人生，程蝶衣则是人戏不分。段小楼在认为该成家立业之时迎娶了名妓菊仙（巩俐），致使程蝶衣认为菊仙是可耻的第三者，使段小楼做了叛徒，自此，三人围绕一出《霸王别姬》生出的爱恨情仇战开始随着时代风云的变迁不断升级，终酿成悲剧。',
  },
  {
    title: '活着',
    rating: '9.3',
    quote: '日子是要一天一天过的，不能一下子过太多。',
    poster: 'https://image.tmdb.org/t/p/w500/hSaH9tt67bozo9K50sbH0s4YjEc.jpg',
    fallbackGradient: 'from-yellow-800 via-amber-700 to-yellow-600',
    genre: '剧情/历史/家庭',
    year: '1994',
    country: '中国大陆/中国香港',
    director: '张艺谋',
    summary: '福贵（葛优）是民国时期的一个地主家的少爷，年轻时由于嗜赌成性，妻子家珍（巩俐）带着女儿凤霞离家出走，当福贵终于醒悟时已经输光了家产。父亲也在羞愤交加中死去。福贵从此洗心革面，和同村的春生一起靠着皮影戏班子艰难度日。然而好景不长，国共内战爆发，福贵和春生被国民党军队抓壮丁，后被解放军俘虏，回到家乡。经历了大跃进、文化大革命等一系列运动，福贵一家人虽然饱经磨难，但仍然相互扶持，坚强地活着。',
  },
  {
    title: '大话西游',
    rating: '9.1',
    quote: '曾经有一份真诚的爱情放在我面前，我没有珍惜。',
    poster: 'https://image.tmdb.org/t/p/w500/yx23Yiuvn9BpS2skn7kBi3S5QIF.jpg',
    fallbackGradient: 'from-indigo-800 via-purple-700 to-violet-600',
    genre: '喜剧/爱情/奇幻',
    year: '1995',
    country: '中国香港/中国大陆',
    director: '刘镇伟',
    summary: '至尊宝（周星驰）被月光宝盒带回到五百年前，遇见紫霞仙子（朱茵），被对方打上烙印成为对方的人，并发觉自己已变成孙悟空。紫霞与青霞（朱茵）本是如来佛祖座前日月神灯的灯芯，二人虽然同一肉身却仇恨颇深，因此紫霞立下誓言，只有拔出她手中紫青宝剑的人才是她的意中人。至尊宝为了救白晶晶（莫文蔚）而穿越时空，却阴差阳错地拔出了紫青宝剑。紫霞决心以身相许，却遭牛魔王（陆树铭）抢亲。至尊宝为救紫霞，戴上了紧箍咒，变成了孙悟空。',
  },
  {
    title: '功夫',
    rating: '8.7',
    quote: '做人如果无梦想，跟咸鱼有什么分别？',
    poster: 'https://image.tmdb.org/t/p/w500/a7eKZMnDnxJi8XNW2Fy1GbEFO8i.jpg',
    fallbackGradient: 'from-yellow-600 via-orange-500 to-red-600',
    genre: '喜剧/动作/犯罪',
    year: '2004',
    country: '中国香港/中国大陆',
    director: '周星驰',
    summary: '1940年代的上海，自小受尽欺辱的街头混混阿星（周星驰）为了能出人头地，可谓窥见机会的缝隙就往里钻，今次他盯上了在上海滩呼风唤雨的黑道势力斧头帮，想借助帮里的威风扬名立万。不想，他假冒斧头帮成员在一幢叫"猪笼城寨"的贫民窟里讹诈时，引出了几位身怀绝技的隐世高人，更惹来斧头帮真正的大举进攻。一场场血雨腥风的较量后，阿星终于领悟到武学的真谛。',
  },
  {
    title: '辛德勒的名单',
    rating: '9.5',
    quote: '凡救一命，即救全世界。',
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    fallbackGradient: 'from-gray-800 via-gray-700 to-slate-600',
    genre: '剧情/历史/战争',
    year: '1993',
    country: '美国',
    director: '史蒂文·斯皮尔伯格',
    summary: '1939年，波兰在纳粹德国的统治下，党卫军对犹太人进行了隔离统治。德国商人奥斯卡·辛德勒（连姆·尼森）来到德军统治下的克拉科夫，开设了一间搪瓷厂，生产军需用品。凭着出众的社交能力和大量的金钱，辛德勒和德军建立了良好的关系，他的工厂雇用犹太人工作，大发战争财。1943年，克拉科夫的犹太人遭到了惨绝人寰的大屠杀，辛德勒目睹这一切，受到了极大的震撼，他贿赂军官，让自己的工厂成为集中营的附属劳役营，在那些疯狂屠杀的日子里，他的工厂也成为了犹太人的避难所。',
  },
  {
    title: '肖申克的救赎',
    rating: '9.7',
    quote: '有些鸟是关不住的，因为每片羽毛都闪耀着自由的光辉。',
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bAY74W56MAn3F2Gq.jpg',
    fallbackGradient: 'from-blue-900 via-blue-700 to-cyan-600',
    genre: '剧情/犯罪',
    year: '1994',
    country: '美国',
    director: '弗兰克·德拉邦特',
    summary: '20世纪40年代末，小有成就的青年银行家安迪（蒂姆·罗宾斯）因涉嫌杀害妻子及她的情人而锒铛入狱。在这座名为肖申克的监狱内，希望似乎虚无缥缈，终身监禁的惩罚无疑注定了安迪接下来灰暗绝望的人生。未过多久，安迪尝试接近囚犯中颇有声望的瑞德（摩根·弗里曼），请求对方帮自己搞来小锤子。以此为契机，二人逐渐熟稔，安迪也仿佛在鱼龙混杂、罪恶横生、黑白混淆的牢狱中找到属于自己的求生之道。他利用自身的专业知识，帮助监狱管理层逃税、洗黑钱，同时凭借与瑞德的交往在犯人中间也渐渐受到礼遇。表面看来，他已如瑞德那样对那堵高墙从憎恨转变为处之泰然，但是对自由的渴望仍促使他朝着心中的希望和目标前进。',
  },
  {
    title: '星际穿越',
    rating: '9.4',
    quote: '爱是唯一能够超越时间和空间的力量。',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    fallbackGradient: 'from-slate-900 via-blue-900 to-indigo-800',
    genre: '剧情/科幻/冒险',
    year: '2014',
    country: '美国/英国',
    director: '克里斯托弗·诺兰',
    summary: '近未来的地球黄沙遍野，小麦、秋葵等基础农作物相继因枯萎病灭绝，人类不再像从前那样仰望星空，放纵想象力和灵感的迸发，而是每日在沙尘暴的肆虐下倒数着所剩不多的光景。在家务农的前NASA宇航员库珀（马修·麦康纳）接连在女儿墨菲（麦肯吉·弗依）的书房发现奇怪的重力场现象，随即得知在某个未知区域内前NASA成员仍秘密进行一个拯救人类的计划。多年以前土星附近出现神秘虫洞，NASA借机将数名宇航员派遣到遥远的星系寻找适合居住的星球。在布兰德教授（迈克尔·凯恩）的劝说下，库珀忍痛告别了女儿，和其他三名专家教授女儿艾米莉亚·布兰德（安妮·海瑟薇）、罗米利（大卫·吉雅西）、多伊尔（韦斯·本特利）搭乘宇宙飞船前往目前已知的最有希望的三颗星球考察。',
  },
]

const today = dayjs()
const movie = computed(() => MOVIES[today.day()]!)
const dateNum = today.date()
const monthWeek = `${today.month() + 1}月 / ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.day()]}`

// 海报加载失败时切换到渐变背景
const posterFailed = ref(false)

// 点击打开电影详情对话框
const { openDialog } = useMovieDetailDialog()
function handleClick() {
  openDialog(movie.value)
}
</script>

<template>
  <div
    class="w-full h-full relative overflow-hidden flex flex-col select-none glass-card cursor-pointer transition-transform hover:scale-105"
    @click="handleClick"
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
    <div v-if="!posterFailed" class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

    <!-- 左上角：日期 -->
    <div class="relative z-10 p-2.5">
      <div class="text-xl font-bold leading-none drop-shadow" :class="posterFailed ? 'text-gray-800 dark:text-white' : 'text-white'">{{ dateNum }}</div>
      <div class="text-[10px] mt-0.5 drop-shadow" :class="posterFailed ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'">{{ monthWeek }}</div>
    </div>

    <!-- 底部：电影信息 -->
    <div class="relative z-10 mt-auto p-2.5 space-y-1">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-semibold truncate drop-shadow" :class="posterFailed ? 'text-gray-800 dark:text-white' : 'text-white'">{{ movie.title }}</span>
        <span class="flex-shrink-0 text-[10px] rounded px-1 py-0.5" :class="posterFailed ? 'text-yellow-600 dark:text-yellow-400 bg-black/5 dark:bg-white/10' : 'text-yellow-400 bg-black/40'">
          ★ {{ movie.rating }}
        </span>
      </div>
      <p class="text-[10px] leading-tight line-clamp-2 drop-shadow" :class="posterFailed ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'">{{ movie.quote }}</p>
    </div>
  </div>
</template>
