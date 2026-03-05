import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './styles/index.css'

// ===== 数据版本迁移 =====
// 每次修改 store 数据结构时，递增此版本号并在下方添加迁移逻辑
const CURRENT_VERSION = 1
const storedVersion = Number(localStorage.getItem('aitabs-version') ?? '0')

if (storedVersion < CURRENT_VERSION) {
  // v0 → v1：初始版本，无需迁移，直接升级标记
  localStorage.setItem('aitabs-version', String(CURRENT_VERSION))
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.mount('#app')
