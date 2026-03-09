<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useMovieDetailDialog } from '@/composables/useMovieDetailDialog'

const { visible, currentMovie, closeDialog } = useMovieDetailDialog()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible && currentMovie"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
        @click.self="closeDialog"
      >
        <div class="glass-dialog rounded-[20px] overflow-hidden flex flex-col relative" style="width: 860px; max-height: 90vh; box-shadow: none; border: none; background: transparent">
          <!-- 背景海报（模糊） -->
          <div
            class="absolute inset-0 bg-cover bg-center bg-no-repeat"
            :style="{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 20, 0, 0.4)), url('${currentMovie.poster}')`,
              filter: 'blur(15px)',
              zIndex: 0
            }"
          />

          <!-- 关闭按钮 -->
          <button
            class="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
            @click="closeDialog"
          >
            <Icon icon="mdi:close" class="text-xl" />
          </button>

          <!-- 内容区域 -->
          <div class="relative z-10 flex-1 overflow-y-auto" style="padding: 50px">
            <div class="flex gap-6">
              <!-- 左侧：电影信息（76%宽度） -->
              <div class="flex-1" style="width: 76%">
                <!-- 标题和评分 -->
                <h2 class="text-4xl font-bold text-white mb-3">
                  {{ currentMovie.title }}
                </h2>

                <!-- 评分 -->
                <div class="flex items-center gap-2 mb-3">
                  <div class="flex items-center gap-0.5">
                    <Icon
                      v-for="i in 5"
                      :key="i"
                      icon="mdi:star"
                      class="w-4 h-4 text-yellow-400"
                    />
                  </div>
                  <span class="text-white text-lg">{{ currentMovie.rating }}</span>
                </div>

                <!-- 基本信息 -->
                <div class="flex items-center gap-3 text-white/90 text-sm mb-2">
                  <span>{{ currentMovie.genre }}</span>
                  <span>{{ currentMovie.year }}</span>
                  <span>{{ currentMovie.country }}</span>
                </div>

                <!-- 导演 -->
                <p class="text-white/90 text-sm mb-6">导演：{{ currentMovie.director }}</p>

                <!-- 经典台词 -->
                <p class="text-lg text-white mb-4 leading-relaxed">
                  " {{ currentMovie.quote }} "
                </p>

                <!-- 剧情简介 -->
                <p class="text-xs text-white/80 leading-5">
                  {{ currentMovie.summary }}
                </p>
              </div>

              <!-- 右侧：电影海报（24%宽度） -->
              <div class="flex-shrink-0" style="width: 24%">
                <img
                  :src="currentMovie.poster"
                  :alt="currentMovie.title"
                  class="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            <!-- 查看电影源链接 -->
            <a
              href="https://movie.douban.com/"
              target="_blank"
              class="block mt-4 text-xs text-orange-200/80 hover:text-orange-200 transition-colors"
              style="clear: both"
            >
              查看电影源 →
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


