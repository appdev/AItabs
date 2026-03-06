import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Service Worker 预缓存静态资源
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // 运行时缓存策略
        runtimeCaching: [
          {
            // Bing 每日壁纸图片：缓存优先，每天刷新
            urlPattern: /^https:\/\/cn\.bing\.com\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bing-wallpaper',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      manifest: {
        name: 'AItabs - 新标签页',
        short_name: 'AItabs',
        description: '简洁高效、可高度定制的浏览器新标签页',
        theme_color: '#1890ff',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心库单独打包
          'vendor-vue': ['vue', 'pinia', 'pinia-plugin-persistedstate'],
          // Element Plus 单独打包（体积大）
          'vendor-element': ['element-plus'],
          // 数据/工具库
          'vendor-utils': ['dayjs', 'dexie', 'nanoid', 'ofetch'],
          // 图标库
          'vendor-iconify': ['@iconify/vue'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(502)
              res.end()
            }
          })
        },
      },
      '/bing-wallpaper': {
        target: 'https://cn.bing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bing-wallpaper/, ''),
      },
    },
  },
})
