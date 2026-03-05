# AItabs 导航网站 - 任务清单

> 参考站点：https://go.itab.link/
> 预估总工时：39 小时（单人约 5 个工作日，两人并行约 3 个工作日）

---

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Vue 3 + TypeScript | 3.5+ | 核心框架，Composition API |
| 构建 | Vite | 6.x | 开发构建工具 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS |
| 样式 | CSS Variables | - | 玻璃模糊主题系统 |
| UI 组件 | Element Plus | latest | 弹窗/表单/Slider 等基础组件 |
| 拖拽 | vue-draggable-plus | latest | CSS Grid 拖拽排序 |
| 状态管理 | Pinia | latest | 全局状态 |
| 持久化 | pinia-plugin-persistedstate | latest | Store 自动持久化 |
| 本地存储 | Dexie.js (IndexedDB) | latest | 图标/组件大量数据存储 |
| 图标 | @iconify/vue | latest | 海量图标按需加载 |
| 日期 | dayjs | latest | 日期处理 + 农历计算 |
| HTTP | ofetch | latest | 轻量 fetch 封装 |
| ID 生成 | nanoid | latest | 唯一 ID 生成 |
| PWA | vite-plugin-pwa | latest | 离线缓存/可安装 |
| 自动导入 | unplugin-auto-import | latest | API 自动导入 |
| 自动导入 | unplugin-vue-components | latest | 组件自动注册 |

---

## 项目结构

```
src/
├── App.vue                          # 主应用入口
├── main.ts                          # 应用初始化
├── styles/
│   ├── index.css                    # Tailwind 入口 + CSS 变量
│   └── glass.css                    # 毛玻璃效果样式集
├── types/
│   ├── icon.ts                      # SiteIcon / SiteInfoResponse
│   ├── widget.ts                    # Widget / WidgetMeta / WidgetType
│   └── settings.ts                  # AppSettings / NavGroup / 子设置类型
├── stores/
│   ├── settings.ts                  # 全局设置 store（主题/壁纸/搜索/图标样式）
│   ├── icons.ts                     # 图标/网址 store（CRUD + 排序）
│   ├── widgets.ts                   # 小组件 store（CRUD + 注册表）
│   └── groups.ts                    # 侧边栏分组 store
├── composables/
│   ├── useClock.ts                  # 时钟/日期/农历
│   ├── useContextMenu.ts            # 右键菜单状态管理
│   ├── useWeather.ts                # 天气数据获取与缓存
│   ├── useWallpaper.ts              # 壁纸管理
│   └── useGridLayout.ts             # 网格布局计算
├── components/
│   ├── layout/
│   │   ├── Sidebar.vue              # 左侧边栏
│   │   ├── Header.vue               # 顶部时钟
│   │   ├── SearchBar.vue            # 搜索栏
│   │   ├── IconGrid.vue             # 图标/组件网格容器
│   │   └── FooterQuote.vue          # 底部一言
│   ├── widgets/
│   │   ├── WidgetWrapper.vue        # 小组件通用容器
│   │   ├── WeatherWidget.vue        # 天气组件
│   │   ├── CalendarWidget.vue       # 日历组件
│   │   ├── HotSearchWidget.vue      # 热搜榜组件
│   │   ├── CountdownWidget.vue      # 下班倒计时组件
│   │   ├── MemoWidget.vue           # 备忘录组件
│   │   ├── MovieWidget.vue          # 电影日历组件
│   │   └── AnniversaryWidget.vue    # 纪念日组件
│   ├── icons/
│   │   ├── IconItem.vue             # 单个图标
│   │   ├── IconFolder.vue           # 文件夹图标
│   │   └── IconEditor.vue           # 图标编辑表单
│   ├── dialogs/
│   │   ├── SettingsDialog.vue       # 设置弹窗
│   │   ├── AddDialog.vue            # 添加图标/组件弹窗
│   │   └── FolderDialog.vue         # 文件夹内容弹窗
│   └── contextmenu/
│       └── ContextMenu.vue          # 右键菜单
├── services/
│   ├── api.ts                       # 外部 API 封装
│   └── db.ts                        # IndexedDB 封装
└── utils/
    ├── color.ts                     # 颜色工具函数
    └── id.ts                        # ID 生成函数
```

---

## 任务列表

### 阶段一：项目基础搭建（3h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T01 | 项目初始化与依赖安装 | 1h | 无 |
| T02 | 全局样式与 CSS 变量体系 | 1h | T01 |
| T03 | TypeScript 类型定义与 Store 骨架 | 1h | T02 |

#### T01 - 项目初始化与依赖安装（1h）

**目标**：从零创建可运行的 Vue3 + TS + Vite 项目骨架

**步骤**：
1. `npm create vue@latest` 创建项目（选择 TypeScript）
2. 安装运行时依赖：
   ```bash
   npm install pinia pinia-plugin-persistedstate element-plus @iconify/vue dayjs ofetch dexie vue-draggable-plus nanoid
   ```
3. 安装开发依赖：
   ```bash
   npm install -D @tailwindcss/vite tailwindcss unplugin-auto-import unplugin-vue-components vite-plugin-pwa
   ```
4. 配置 `vite.config.ts`：
   - 添加 `@tailwindcss/vite` 插件
   - 配置 `unplugin-auto-import`（Element Plus resolver + Vue/Pinia 自动导入）
   - 配置 `unplugin-vue-components`（Element Plus resolver）
   - 配置 `vite-plugin-pwa` 基础 manifest
   - 设置路径别名 `@` → `/src`
5. 配置 `index.html`：lang="zh-CN"、meta viewport、title
6. 配置 `main.ts`：创建 Pinia 实例 + persistedstate 插件

**验证**：`npm run dev` 正常运行，控制台无报错

---

#### T02 - 全局样式与 CSS 变量体系（1h）

**目标**：建立完整的 CSS 变量系统和毛玻璃效果样式集

**步骤**：
1. 创建 `src/styles/index.css`，引入 Tailwind 和 glass.css
2. 定义 `:root` CSS 变量（所有值参考 iTab 实际页面）：
   - 壁纸相关：`--wall-blur`、`--wall-mask`、`--dialog-blur`
   - 图标相关：`--icon-size`(60px)、`--icon-gap`(30px)、`--icon-radius`(18px)、`--icon-opacity`、`--icon-name-size`(12px)、`--icon-name-color`(#fff)
   - 侧边栏：`--sidebar-width`(50px)、`--sidebar-opacity`(0.4)
   - 搜索栏：`--search-height`(46px)、`--search-radius`(23px)、`--search-bg-color`(0.5)
   - 时钟：`--time-size`(70px)、`--time-color`(#fff)、`--time-font`
   - 主题色：`--img-bg`(38,64,85)、`--img-text`(233,233,233)
3. 设置全局样式：html/body/\#app 全屏、禁止溢出、字体、滚动条美化
4. 创建 `src/styles/glass.css`，定义 6 个毛玻璃 class：
   - `.glass-sidebar`：blur(6px) + rgba(var(--img-bg), 0.4)
   - `.glass-search`：blur(6px) + rgba(255,255,255,0.5)
   - `.glass-card` / `.glass-folder`：blur(10px) + rgba(255,255,255,0.6)
   - `.glass-menu`：blur(10px) + rgba(11,11,11,0.7)
   - `.glass-dialog`：blur(18px) + rgba(var(--img-bg), 0.8)
   - `.glass-quote`：blur(12px) + rgba(0,0,0,0.2)

**验证**：页面全屏显示黑色背景，各 glass class 可正常应用

---

#### T03 - TypeScript 类型定义与 Store 骨架（1h）

**目标**：定义所有数据类型和 4 个 Pinia Store 骨架

**步骤**：
1. 创建 `types/icon.ts`：`SiteIcon`（id/name/url/icon/bgColor/size/type/order/groupId/children）、`IconSize`、`SiteInfoResponse`
2. 创建 `types/widget.ts`：`Widget`（id/type/size/order/groupId/config）、`WidgetType`、`WidgetSize`、`WidgetMeta`
3. 创建 `types/settings.ts`：`AppSettings`（包含 SearchEngine/ThemeSettings/WallpaperSettings/SearchSettings/TimeSettings/IconSettings/SidebarSettings/LayoutSettings/OpenSettings）、`NavGroup`
4. 创建 `stores/settings.ts`：默认设置 + updateCSSVars() + resetSettings()，persist 到 localStorage
5. 创建 `stores/groups.ts`：默认 6 个分组（主页/编程/设计/产品/AI/摸鱼），activeGroupId，CRUD + reorder
6. 创建 `stores/icons.ts`：默认 10 个常用图标，currentIcons 按分组过滤，addIcon/removeIcon/updateIcon/reorderIcons
7. 创建 `stores/widgets.ts`：WIDGET_REGISTRY 注册表，默认 4 个组件（天气/日历/热搜/倒计时），CRUD + reorder
8. 创建 `services/api.ts`：`fetchSiteInfo(url)` → GET `https://api.codelife.cc/website/info?lang=cn&url=`
9. 创建 `services/db.ts`：Dexie.js 初始化 icons + widgets 表
10. 创建 `utils/id.ts`：nanoid(12) 封装
11. 创建 `utils/color.ts`：hexToRgb / getContrastColor / PRESET_COLORS

**验证**：所有 Store 可在组件中正常导入和读写，API 函数可调用返回数据

---

### 阶段二：核心布局（6h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T04 | 左侧边栏组件 | 1.5h | T03 |
| T05 | 顶部时钟与搜索栏 | 1.5h | T03 |
| T06 | 图标网格布局容器 | 2h | T03 |
| T07 | 主页面整体组装 | 1h | T04, T05, T06 |

#### T04 - 左侧边栏组件（1.5h）

**文件**：`components/layout/Sidebar.vue`

**功能**：
- 固定定位，宽 50px（var(--sidebar-width)），全高，z-index 2
- 顶部：圆形头像（30px，默认占位图标）
- 中部：分组导航列表
  - 数据源：`groupsStore.sortedGroups`
  - 每项：Iconify 图标 + 分组名文字（12px）
  - 当前分组高亮（文字加粗 + 左侧指示条）
  - 点击切换：调用 `groupsStore.setActiveGroup(id)`
- 底部：设置齿轮按钮，点击 emit `openSettings`
- 样式：`.glass-sidebar` 毛玻璃效果
- 默认分组：主页（home-outline）、编程（code-tags）、设计（palette-outline）、产品（lightbulb-outline）、AI（robot-outline）、摸鱼（fish）

**验证**：侧边栏渲染正确，分组切换正常，毛玻璃效果生效

---

#### T05 - 顶部时钟与搜索栏（1.5h）

**文件**：`composables/useClock.ts`、`components/layout/Header.vue`、`components/layout/SearchBar.vue`

**useClock.ts**：
- 每秒更新响应式数据：hours/minutes/seconds/dateStr/weekStr/lunarStr
- 农历计算：内置阳历转农历算法（1900-2100 年范围）
- 返回值全部为 ref

**Header.vue**：
- 大号时钟数字：`font-size: var(--time-size)`，"HH:MM" 格式
- 冒号分隔符居中
- 日期行：月日 + 空格 + 星期 + 空格 + 农历
- 根据 `settingsStore.settings.time` 控制各部分显示/隐藏
- 文字颜色：`var(--time-color)`

**SearchBar.vue**：
- 外层 form，`.glass-search` 样式，圆角 var(--search-radius)，高度 var(--search-height)
- 左侧搜索图标（mdi:magnify）
- 中间 text input，placeholder "输入搜索内容"
- 右侧搜索按钮
- 输入框下方：搜索引擎标签栏，数据从 `settingsStore.settings.searchEngines` 读取
- 当前引擎高亮（activeEngine）
- 点击标签切换引擎
- 提交表单：`window.open(engineHref + query, '_blank')`
- 根据 `settingsStore.settings.search.show` 控制显示/隐藏

**验证**：时钟实时更新（含农历），搜索栏输入后回车可跳转对应搜索引擎

---

#### T06 - 图标网格布局容器（2h）

**文件**：`composables/useGridLayout.ts`、`components/layout/IconGrid.vue`、`components/layout/FooterQuote.vue`

**useGridLayout.ts**：
- 监听 window resize，计算可用宽度
- 根据 icon.maxWidth 和窗口宽度计算实际网格容器宽度
- 计算列数：`Math.floor(width / (iconSize + gap))`

**IconGrid.vue**：
- CSS Grid 容器，`display: grid`
- `grid-template-columns: repeat(auto-fill, var(--icon-size))`
- `gap: var(--icon-gap)`
- 最大宽度居中
- 数据源：合并 `widgetsStore.currentWidgets` + `iconsStore.currentIcons`，按 order 排序
- 每个子元素根据 size 设置 CSS grid span：
  - `1x1` → grid-column: span 1; grid-row: span 1
  - `2x2` → grid-column: span 2; grid-row: span 2
  - `2x4` → grid-column: span 4; grid-row: span 2
  - `1x2` → grid-column: span 2; grid-row: span 1
  - `2x1` → grid-column: span 1; grid-row: span 2
- Widget 项渲染对应 Widget 组件
- Icon 项渲染 IconItem 组件
- 空区域右键 emit contextmenu 事件

**FooterQuote.vue**：
- 固定在底部居中
- `.glass-quote` 样式，圆角，padding
- 随机显示一条名言（硬编码 5-10 条）
- 白色文字，14px

**验证**：网格正确排列各尺寸元素，底部一言显示正常

---

#### T07 - 主页面整体组装（1h）

**文件**：`App.vue`

**功能**：
- 壁纸背景层（最底层 z-index）：
  - 背景图 div：`background-image: url(wallpaper.src)`，cover，fixed
  - 模糊层：`filter: blur(var(--wall-blur))`
  - 遮罩层：`background: rgba(0,0,0, var(--wall-mask))`
- Sidebar 组件（监听 openSettings 事件）
- 主内容区：`margin-left: var(--sidebar-width)`
  - Header 时钟
  - SearchBar 搜索栏
  - IconGrid 图标网格
  - FooterQuote 一言
- 底部操作按钮（在图标区下方）：
  - "添加组件" 按钮（打开 AddDialog，widget tab）
  - "添加图标" 按钮（打开 AddDialog，custom tab）
- SettingsDialog（v-model:visible）
- AddDialog（v-model:visible）
- ContextMenu 全局右键菜单
- 初始化：onMounted 中调用 settingsStore.updateCSSVars()

**验证**：完整页面布局与 iTab 结构一致，壁纸+侧边栏+时钟+搜索栏+网格+一言均正常显示

---

### 阶段三：图标系统（6.5h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T08 | 单个图标组件 | 1.5h | T07 |
| T09 | 文件夹图标与弹窗 | 1.5h | T08 |
| T10 | 图标拖拽排序 | 2h | T08 |
| T11 | 右键菜单组件 | 1.5h | T08 |

#### T08 - 单个图标组件（1.5h）

**文件**：`components/icons/IconItem.vue`

**Props**：`icon: SiteIcon`

**功能**：
- 容器设置 grid span（根据 icon.size）
- 图标渲染（三种模式）：
  - URL 图标：`<img :src="icon.icon">` + bgColor 背景
  - 文字图标：首字母大写 + bgColor 背景
  - 无图标：纯 bgColor 背景 + 首字母
- 图标容器：宽高 var(--icon-size)，圆角 var(--icon-radius)，透明度 var(--icon-opacity)
- 2x2 及更大尺寸按比例放大
- 底部名称：font-size var(--icon-name-size)，color var(--icon-name-color)
- hover 效果：`transform: scale(1.05)`，transition 200ms
- 点击：`window.open(icon.url, settingsStore.settings.open.iconBlank ? '_blank' : '_self')`
- @contextmenu.prevent：emit('contextmenu', { event, id: icon.id, type: 'icon' })

**验证**：图标正确渲染三种模式，hover 动画流畅，点击跳转正常

---

#### T09 - 文件夹图标与弹窗（1.5h）

**文件**：`components/icons/IconFolder.vue`、`components/dialogs/FolderDialog.vue`

**IconFolder.vue**：
- Props：`icon: SiteIcon`（type='folder'）
- `.glass-folder` 毛玻璃背景
- 内部 2x2 小网格，显示前 4 个 children 的缩略图标（16px x 16px）
- 底部文件夹名称
- 点击：打开 FolderDialog

**FolderDialog.vue**：
- Props：`folder: SiteIcon | null`、`visible: boolean`
- Popover 风格弹窗（非全屏），`.glass-card` 背景
- 标题：文件夹名称
- 内容：网格展示所有 children 图标
- 每个子图标可点击跳转 URL
- 点击外部关闭

**验证**：文件夹展示预览缩略图，点击弹出内容弹窗，子图标可点击

---

#### T10 - 图标拖拽排序（2h）

**文件**：修改 `IconGrid.vue`，修改 `Sidebar.vue`

**IconGrid 拖拽**：
- 集成 `vue-draggable-plus` 的 `useDraggable` 或 `<VueDraggable>` 组件
- 配置：`animation: 150`，`ghostClass: 'drag-ghost'`，`chosenClass: 'drag-chosen'`
- 拖拽占位样式：半透明 + 虚线边框
- 拖拽结束回调：更新 iconsStore.reorderIcons() 和 widgetsStore.reorderWidgets()
- 处理不同 size 元素的 grid span 拖拽兼容

**Sidebar 拖拽**：
- 分组列表支持上下拖拽排序
- 拖拽结束回调：groupsStore.reorderGroups()

**CSS**：
- `.drag-ghost`：opacity 0.5, outline dashed
- `.drag-chosen`：transform scale(1.05), box-shadow

**验证**：图标可拖拽换位，动画流畅，刷新后顺序保持

---

#### T11 - 右键菜单组件（1.5h）

**文件**：`composables/useContextMenu.ts`、`components/contextmenu/ContextMenu.vue`

**useContextMenu.ts**：
- 全局单例状态：visible / x / y / targetId / targetType
- show(event, targetId, targetType) 方法
- hide() 方法
- 自动监听 document click 和 ESC 关闭

**ContextMenu.vue**：
- `<Teleport to="body">`
- `position: fixed`，`left: x`，`top: y`
- v-show="state.visible"
- `.glass-menu` 样式，圆角 12px，min-width 160px，shadow
- 菜单项列表：
  1. 在新标签页打开（icon: mdi:open-in-new）
  2. 布局（icon: mdi:view-grid-outline）→ 内联 5 个尺寸按钮 1x1/1x2/2x1/2x2/2x4，当前高亮
  3. 编辑图标（icon: mdi:pencil-outline）
  4. 删除（icon: mdi:delete-outline，红色）
- 每项：flex 布局，图标 + 文字，hover 高亮，cursor pointer
- 白色文字
- targetType='widget' 时隐藏"在新标签页打开"
- targetType='grid' 时只显示通用选项

**集成**：在 IconItem 和 IconGrid 上绑定 @contextmenu.prevent

**验证**：右键弹出菜单定位准确，各项功能正常

---

### 阶段四：弹窗系统（7.5h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T12 | 设置弹窗 - 框架与导航 | 1.5h | T07 |
| T13 | 设置弹窗 - 图标/搜索/时间面板 | 2h | T12 |
| T14 | 设置弹窗 - 壁纸/主题/侧边栏/布局面板 | 2h | T12 |
| T15 | 添加弹窗 - 三合一 | 2h | T07 |

#### T12 - 设置弹窗 - 框架与导航（1.5h）

**文件**：`components/dialogs/SettingsDialog.vue`

**功能**：
- 右侧抽屉，宽 320px，fixed 定位，z-index 100
- CSS transition：从右侧滑入（transform: translateX(100%) → 0）
- Props：`visible: boolean`，Emits：`update:visible`
- 左侧菜单栏（约 100px 宽）：
  - 搜索栏（mdi:magnify）
  - 图标（mdi:apps）
  - 时间/日期（mdi:clock-outline）
  - 主题/壁纸（mdi:palette-outline）
  - 布局（mdi:view-dashboard-outline）
  - 侧边栏（mdi:dock-left）
  - 备份与恢复（mdi:cloud-sync-outline）
  - 重置设置（mdi:refresh）
  - 关于（mdi:information-outline）
- 右侧内容区：根据 activeMenu 切换
- 关闭按钮（X）
- `.glass-dialog` 背景

**验证**：弹窗可打开/关闭，菜单切换正常，滑入动画流畅

---

#### T13 - 设置弹窗 - 图标/搜索/时间设置面板（2h）

**文件**：继续在 `SettingsDialog.vue` 内实现

**搜索栏面板**：
- 显示搜索栏（ElSwitch）→ settings.search.show
- 搜索栏高度（ElSlider 30-60）→ settings.search.height
- 搜索栏圆角（ElSlider 0-30）→ settings.search.radius
- 背景透明度（ElSlider 0-1 step 0.1）→ settings.search.bgColor

**图标面板**：
- 图标样式（两个按钮：默认/圆形）→ settings.icon.style
- 图标大小（ElSlider 40-80）→ settings.icon.iconSize
- 图标圆角（ElSlider 0-50）→ settings.icon.iconRadius
- 不透明度（ElSlider 0-1 step 0.01）→ settings.icon.opacity
- 间距（ElSlider 10-60 + 同步开关）→ settings.icon.gapX / gapY / gapSync
- 图标名称显示（ElSwitch）→ settings.icon.nameShow
- 文字大小（ElSlider 10-18）→ settings.icon.nameSize
- 名称颜色（预设色点 + 自定义输入）→ settings.icon.nameColor
- 最大宽度（数字输入 + px/% 切换）→ settings.icon.maxWidth / maxWidthUnit

**时间/日期面板**：
- 显示时钟（ElSwitch）→ settings.time.show
- 字号大小（ElSlider 40-120）→ settings.time.size
- 24 小时制（ElSwitch）→ settings.time.hour24
- 显示秒（ElSwitch）→ settings.time.sec
- 显示月份/星期/农历（各一个 ElSwitch）→ settings.time.month/week/lunar
- 时钟颜色（颜色输入）→ settings.time.color

**所有设置实时生效**（通过 settingsStore.updateCSSVars watch 机制）

**验证**：修改任意设置项后主页面立即反映变化

---

#### T14 - 设置弹窗 - 壁纸/主题/侧边栏/布局设置面板（2h）

**文件**：继续在 `SettingsDialog.vue` 内实现

**主题/壁纸面板**：
- 浅色/深色模式切换（两个按钮）→ settings.theme.mode
- 跟随系统（ElSwitch）→ settings.theme.system
- 壁纸遮罩（ElSlider 0-1）→ settings.wallpaper.mask
- 壁纸模糊（ElSlider 0-30）→ settings.wallpaper.blur
- 壁纸来源（默认/自定义URL/本地上传 三选一）→ settings.wallpaper.type
- 壁纸 URL 输入（type=url 时显示）→ settings.wallpaper.src

**布局面板**：
- 视图模式（小组件视图/简洁视图 两个按钮）→ settings.layout.view
- 一言显示（ElSwitch）→ settings.layout.yiyan

**侧边栏面板**：
- 位置（左/右 两个按钮）→ settings.sidebar.placement
- 自动隐藏（ElSwitch）→ settings.sidebar.autoHide
- 宽度（ElSlider 40-80）→ settings.sidebar.width
- 透明度（ElSlider 0-1）→ settings.sidebar.opacity

**备份与恢复面板**：
- 导出按钮：序列化所有 store → JSON → 下载为 aitabs-backup.json
- 导入按钮：文件选择器 → 读取 JSON → 写入各 store

**重置设置面板**：
- 警告文字 + 重置按钮
- 确认后调用各 store 的 reset 方法

**关于面板**：
- 应用名称、版本、GitHub 链接

**验证**：壁纸模糊/遮罩可调，侧边栏位置可切换，数据可导出导入

---

#### T15 - 添加弹窗 - 三合一（2h）

**文件**：`components/dialogs/AddDialog.vue`

**功能**：
- 居中弹窗，80vw x 70vh，毛玻璃背景
- Props：`visible: boolean`、`activeTab: 'widget' | 'nav' | 'custom'`
- Emits：`update:visible`

**小组件 Tab**：
- 分类标签栏：探索/全部/效率/工具/开发/设计/创意/娱乐/其他
- 排序：今日推荐/最近更新/最受欢迎
- 卡片网格（每行 2-3 张）：
  - 预览区（图标 + 模拟效果）
  - 名称 + 描述
  - 安装量（硬编码）+ "添加"按钮
- 数据源：`WIDGET_REGISTRY`（天气/日历/热搜/倒计时/备忘录/电影日历/纪念日）
- 添加：调用 `widgetsStore.addWidget(type)`

**网址导航 Tab**：
- 分类标签栏：浏览器/AI/应用/新闻/科技/效率/学习/购物/社交/阅读/设计/金融/其他
- 卡片网格：图标 + 名称 + 描述 + 外链图标 + "添加"按钮
- 预设 20+ 热门网站数据（百度/Google/GitHub/B站/知乎/淘宝/京东/微博/抖音/豆瓣/掘金/CSDN/YouTube/Twitter/ChatGPT 等）
- 添加：调用 `iconsStore.addIcon({ name, url, icon, bgColor })`

**自定义图标 Tab**：
- URL 输入框 + "获取图标"按钮
- 获取图标：调用 `fetchSiteInfo(url)` → 自动填充 name/icon/bgColor
- 名称输入框
- 图标颜色选择器（20 个预设色点）
- 图标文字输入（默认取名称首字母）
- 图标来源切换：文字图标 / 上传图片
- 实时预览区
- "保存"按钮：添加后关闭
- "保存并继续"按钮：添加后清空表单

**验证**：三个 Tab 切换正常，自定义图标 API 获取正常，添加后主页面出现新图标

---

### 阶段五：小组件开发（8.5h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T16 | 小组件通用容器与天气组件 | 2h | T06 |
| T17 | 日历与纪念日组件 | 1.5h | T16 |
| T18 | 热搜榜组件 | 2h | T16 |
| T19 | 下班倒计时组件 | 1.5h | T16 |
| T20 | 备忘录与电影日历组件 | 1.5h | T16 |

#### T16 - 小组件通用容器与天气组件（2h）

**WidgetWrapper.vue**：
- Props：`type: WidgetType`、`size: WidgetSize`、`widgetId: string`
- slot 插槽渲染具体组件内容
- 容器：圆角 var(--icon-radius)，overflow hidden
- 设置 grid-column/row span（2x2 → span 2,2; 2x4 → span 4,2）
- @contextmenu.prevent emit 事件

**useWeather.ts**：
- 调用 wttr.in API（`https://wttr.in/?format=j1`）或和风天气
- 缓存到 localStorage，30 分钟过期
- 返回：city/temp/desc/high/low/aqi（响应式 ref）

**WeatherWidget.vue**（2x2）：
- 暖色渐变背景
- 左上：城市名 + 天气图标
- 中间：温度大字（如 "18°"）
- 下方：AQI 标签 + "最高X° 最低X°"
- 文字标签 "天气"

**验证**：天气数据获取并正确展示

---

#### T17 - 日历与纪念日组件（1.5h）

**CalendarWidget.vue**（2x2）：
- 顶部：圆角橙色徽章 "2026年3月"
- 中间：大号日期数字 "5"
- 下方：第X天 第X周 / 农历日期 / 星期X
- 使用 dayjs 计算周数（dayOfYear / isoWeek）
- 农历复用 useClock 中的算法

**AnniversaryWidget.vue**（2x2）：
- 标题 "你在世界已经"
- 大号天数（计算 today - startDate）
- 底部起始日期 "1997-10-1"
- 配置：config.startDate（默认 '1997-10-01'）、config.title

**验证**：日历日期和农历正确，纪念日天数准确

---

#### T18 - 热搜榜组件（2h）

**HotSearchWidget.vue**（2x4）：
- 顶部 3 个标签：百度 / 微博 / 抖音
- 标签切换动画
- 列表区域（可滚动）：
  - 序号（1-20）+ 标题文字 + 热度值（如 "781.0万"）
  - 前 3 名序号颜色：#ff4444 / #ff8800 / #ffcc00
  - 其余序号灰色
- 点击条目：window.open 搜索对应关键词
- 数据获取：
  - 先用硬编码 mock 数据（每个源 20 条）
  - 后续对接真实 API（百度热搜 / 微博热搜）
  - 缓存 10 分钟
- 白色半透明背景

**验证**：三个源切换流畅，列表滚动正常

---

#### T19 - 下班倒计时组件（1.5h）

**CountdownWidget.vue**（2x4）：
- 左侧区域（约 60% 宽度）：
  - "下班还有" 标题
  - 大号倒计时 "07:29:08"（每秒更新，setInterval）
  - 猫咪装饰（用 emoji 或 SVG）
- 右侧区域（约 40% 宽度），3 个迷你卡片：
  - 发薪日倒计时："发薪 X天"
  - 最近节日倒计时："XX节 X天"
  - 今日收入："今天赚了 XXX.XX¥"
- 配置项（config）：
  - offWork: '18:00'（下班时间）
  - salary: 10000（月薪）
  - payDay: 10（发薪日）
- 计算逻辑：
  - 倒计时 = offWork 时间 - now（已过下班显示 "00:00:00"）
  - 发薪天数 = 下个月 payDay - today
  - 今日收入 = (salary / 当月工作日数) * (已过工时 / 8)

**验证**：倒计时实时跳动，各项计算正确

---

#### T20 - 备忘录与电影日历组件（1.5h）

**MemoWidget.vue**（2x2）：
- 顶部标题栏："备忘录"，绿色渐变背景
- 主体：textarea 或 contenteditable div
- 文字白色，12-14px
- 内容变化时自动保存到 widgetsStore（debounce 500ms）
- 配置：config.content（字符串）

**MovieWidget.vue**（2x2）：
- 全背景电影海报（background-image cover）
- 从底部到中部的渐变遮罩（`linear-gradient(transparent, rgba(0,0,0,0.8))`）
- 左上角：日期 "05"  +  "3月/周四"
- 中下：电影名 + "豆瓣 X.X"
- 底部：经典台词
- 硬编码 7 部电影数据（每天一部，按 dayOfWeek 选择）
- 数据结构：{ title, rating, quote, poster }

**验证**：备忘录可编辑并持久化，电影日历每天展示不同内容

---

### 阶段六：交互完善（4.5h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T21 | 壁纸系统 | 1.5h | T07 |
| T22 | 图标编辑功能 | 1.5h | T08, T11 |
| T23 | 搜索引擎管理与全局搜索增强 | 1.5h | T05 |

#### T21 - 壁纸系统（1.5h）

**文件**：`composables/useWallpaper.ts`，修改 `App.vue`

**useWallpaper.ts**：
- 管理壁纸状态，监听 settingsStore.settings.wallpaper 变化
- 壁纸预加载（new Image() → onload）
- 切换动画（CSS transition opacity 1s）
- 本地上传：File → base64 → 存入 IndexedDB（db.ts 新增 wallpapers 表）
- 默认壁纸 URL

**App.vue 壁纸层**（3 层 div，fixed，inset-0，z-index -1）：
- 第 1 层：背景图（background-image，cover，center）
- 第 2 层：模糊层（filter: blur(var(--wall-blur))，同样背景图 + 完全覆盖）
- 第 3 层：遮罩层（background: rgba(0,0,0, var(--wall-mask))）

**验证**：壁纸正常显示，模糊/遮罩滑块实时生效，切换壁纸有淡入淡出

---

#### T22 - 图标编辑功能（1.5h）

**文件**：`components/icons/IconEditor.vue`，修改 ContextMenu 和 IconGrid

**IconEditor.vue**：
- Element Plus ElDialog 弹窗
- Props：`modelValue: SiteIcon | null`、`visible: boolean`
- 表单字段：
  - URL（input）+ "获取图标"按钮 → fetchSiteInfo
  - 名称（input）
  - 图标颜色（20 个预设色点 + 自定义输入）
  - 图标文字（input，默认首字母）
  - 图标来源切换：文字图标 / 上传图片 / URL 图标
  - 布局尺寸：5 个按钮 1x1/1x2/2x1/2x2/2x4
  - 打开方式：新标签页 / 当前页（switch）
- 实时预览
- 保存：iconsStore.updateIcon(id, updates)
- 取消：关闭弹窗

**集成到 ContextMenu**：
- "编辑图标"点击 → 打开 IconEditor，传入 targetId 对应的图标数据
- "删除"点击 → ElMessageBox.confirm → iconsStore.removeIcon(targetId)

**验证**：编辑图标后立即更新显示，删除后图标消失

---

#### T23 - 搜索引擎管理与全局搜索增强（1.5h）

**文件**：修改 `SettingsDialog.vue` 搜索栏面板，修改 `SearchBar.vue`

**设置 - 搜索引擎管理**：
- 搜索引擎列表（可排序）
- 每项：名称 + URL 模板 + 删除按钮
- 添加按钮：输入名称 + URL 模板（用 `%s` 或直接拼接）
- 默认引擎选择

**SearchBar.vue 增强**：
- 快捷键：全局监听 `/` 键聚焦搜索框，`ESC` 失焦
- Tab 键切换搜索引擎
- 搜索历史（可选，settings.search.history 开关）：
  - 搜索时记录到 localStorage
  - 聚焦时显示最近 5 条历史
  - 可清除

**验证**：搜索引擎可增删改排序，快捷键正常，历史记录正常

---

### 阶段七：数据与部署（3h）

| 编号 | 任务名称 | 预估工时 | 前置依赖 |
|------|----------|----------|----------|
| T24 | 数据持久化与默认数据 | 1.5h | T03 |
| T25 | PWA 配置与部署 | 1.5h | T07 |

#### T24 - 数据持久化与默认数据（1.5h）

**功能**：
- settingsStore + groupsStore：pinia-plugin-persistedstate → localStorage
- iconsStore + widgetsStore：pinia-plugin-persistedstate → localStorage（数据量可控）
- 首次访问检测：localStorage 无 `aitabs-settings` 时初始化默认数据
- 默认数据包含：
  - 6 个分组
  - 10 个常用图标（百度/淘宝/京东/B站/知乎/GitHub/掘金/微博/豆瓣/天猫）
  - 4 个默认组件（天气/日历/热搜/倒计时）
  - 完整默认设置
- 数据版本号：localStorage `aitabs-version`，用于未来迁移

**验证**：首次访问有完整默认内容，刷新保持数据，清除 localStorage 后恢复默认

---

#### T25 - PWA 配置与部署（1.5h）

**功能**：
- vite-plugin-pwa manifest 完善：name/short_name/icons/theme_color/background_color/display
- 准备 icon-192.png 和 icon-512.png（可用在线工具生成）
- favicon.ico
- Service Worker 配置：缓存静态资源
- 生产构建优化：
  - 弹窗组件异步加载（defineAsyncComponent）
  - Vite 代码分割
- 部署：
  - 创建 `vercel.json`：`{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
  - 或 Cloudflare Pages `_redirects`

**验证**：`npm run build` 成功，Lighthouse PWA 评分 > 90，可安装到桌面

---

## 任务依赖关系

```
T01 → T02 → T03 ──┬── T04 ──┐
                   ├── T05 ──┤── T07 ──┬── T08 ──┬── T09
                   ├── T06 ──┘         │         ├── T10
                   │                   │         ├── T11 ──┐
                   │                   │         └─────────┴── T22
                   │                   ├── T12 ──┬── T13
                   │                   │         └── T14
                   │                   ├── T15
                   │                   ├── T21
                   │                   └── T25
                   ├── T24
                   └── T16 ──┬── T17
                             ├── T18
                             ├── T19
                             └── T20
T05 ──── T23
```

## 可并行任务组

完成 T07 后可分 4 组并行开发：

| 组别 | 任务链 | 负责内容 |
|------|--------|----------|
| 组 A | T08 → T09, T10, T11 → T22 | 图标系统 |
| 组 B | T12 → T13 + T14, T15 | 弹窗系统 |
| 组 C | T16 → T17, T18, T19, T20 | 小组件 |
| 组 D | T21, T23, T24, T25 | 独立功能 |

## 工时汇总

| 阶段 | 任务数 | 预估工时 |
|------|--------|----------|
| 阶段一：项目基础搭建 | 3 | 3h |
| 阶段二：核心布局 | 4 | 6h |
| 阶段三：图标系统 | 4 | 6.5h |
| 阶段四：弹窗系统 | 4 | 7.5h |
| 阶段五：小组件开发 | 5 | 8.5h |
| 阶段六：交互完善 | 3 | 4.5h |
| 阶段七：数据与部署 | 2 | 3h |
| **合计** | **25** | **39h** |
