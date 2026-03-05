# AItabs 导航网站 - 功能清单

> 本文档详细列出所有需要实现的功能，按模块组织，包含每个功能的交互细节和数据规格。

---

## 一、页面整体布局

### 1.1 壁纸背景层

| 属性 | 说明 |
|------|------|
| 层级 | z-index 最低（-1），三层 div 叠加 |
| 第 1 层 | 背景图片（background-image, cover, center, fixed） |
| 第 2 层 | 模糊层（filter: blur(var(--wall-blur))，范围 0-30px） |
| 第 3 层 | 遮罩层（background: rgba(0,0,0, var(--wall-mask))，范围 0-1） |
| 默认壁纸 | `https://files.codelife.cc/itab/defaultWallpaper/defaultWallpaper.webp` |
| 壁纸来源 | 默认 / 自定义 URL / 本地上传 |
| 切换动画 | 淡入淡出（CSS transition opacity 1s） |
| 预加载 | new Image() 预加载后再显示 |

### 1.2 左侧边栏（Sidebar）

| 属性 | 说明 |
|------|------|
| 位置 | 固定定位，可切换左/右 |
| 宽度 | 默认 50px（可设置 40-80px） |
| 高度 | 全屏高度 |
| z-index | 2 |
| 背景效果 | 毛玻璃 blur(6px) + rgba(var(--img-bg), var(--sidebar-opacity)) |
| 透明度 | 默认 0.4（可设置 0-1） |
| 自动隐藏 | 可选，鼠标移入显示，移出隐藏 |

**子元素**：

| 区域 | 内容 | 交互 |
|------|------|------|
| 顶部 | 圆形头像（30px） | 点击展开用户菜单（可选） |
| 中部 | 分组导航列表 | 点击切换分组，支持拖拽排序 |
| 底部 | 设置按钮（齿轮图标） | 点击打开设置弹窗 |

**默认分组**：

| 分组名 | 图标 | ID |
|--------|------|-----|
| 主页 | mdi:home-outline | 1 |
| 编程 | mdi:code-tags | 2 |
| 设计 | mdi:palette-outline | 3 |
| 产品 | mdi:lightbulb-outline | 4 |
| AI | mdi:robot-outline | 5 |
| 摸鱼 | mdi:fish | 6 |

### 1.3 主内容区

| 属性 | 说明 |
|------|------|
| 布局 | margin-left: var(--sidebar-width)，全高 |
| 内容顺序 | 时钟 → 搜索栏 → 图标网格 → 一言 |
| 滚动 | 内容区可垂直滚动 |

---

## 二、时钟与日期（Header）

### 2.1 时钟显示

| 属性 | 说明 | 可设置 |
|------|------|--------|
| 字号 | 默认 70px | 40-120px |
| 颜色 | 默认 #ffffff | 任意颜色 |
| 字重 | 默认 400 | - |
| 格式 | 默认 24 小时制 "HH:MM" | 可切换 12 小时制 |
| 秒钟 | 默认不显示 | 可开启显示 |
| 显示/隐藏 | 默认显示 | 可关闭 |

### 2.2 日期行

| 元素 | 示例 | 可设置 |
|------|------|--------|
| 月日 | "3月5日" | 显示/隐藏 |
| 星期 | "星期四" | 显示/隐藏 |
| 农历 | "正月十七" | 显示/隐藏 |

### 2.3 农历计算

- 算法范围：1900-2100 年
- 输出：农历月名（正/二/三/.../冬/腊） + 日名（初一/初二/.../三十）
- 每秒更新一次

---

## 三、搜索栏（SearchBar）

### 3.1 基础功能

| 属性 | 说明 | 可设置 |
|------|------|--------|
| 高度 | 默认 46px | 30-60px |
| 圆角 | 默认 23px | 0-30px |
| 背景 | 毛玻璃 blur(6px) + rgba(255,255,255,0.5) | 透明度 0-1 |
| 显示/隐藏 | 默认显示 | 可关闭 |
| 占位符 | "输入搜索内容" | - |

### 3.2 搜索引擎

| 引擎名 | URL 模板 | 默认 |
|--------|----------|------|
| 百度 | `https://www.baidu.com/s?wd=` | 是 |
| 必应 | `https://www.bing.com/search?q=` | - |
| Google | `https://www.google.com/search?q=` | - |
| 秘塔AI | `https://metaso.cn/?q=` | - |

**交互**：
- 输入框下方显示引擎标签，当前引擎高亮
- 点击标签切换引擎
- 回车/点击搜索按钮：`window.open(engineHref + query, '_blank')`
- Tab 键快速切换引擎
- `/` 键全局聚焦搜索框
- ESC 键失焦

### 3.3 搜索引擎管理（设置中）

- 可添加自定义引擎（名称 + URL 模板）
- 可删除非默认引擎
- 可拖拽排序引擎显示顺序
- 可设置默认引擎

### 3.4 搜索历史（可选功能）

- 开关控制（默认关闭）
- 搜索时记录关键词到 localStorage
- 聚焦搜索框时显示最近 5 条历史
- 可一键清除历史

---

## 四、图标网格（IconGrid）

### 4.1 网格布局

| 属性 | 说明 | 可设置 |
|------|------|--------|
| 布局 | CSS Grid | - |
| 列 | auto-fill, var(--icon-size) | 随窗口自适应 |
| 间距 | 默认 30px | 10-60px |
| 最大宽度 | 默认 1350px | 可设置 px/% |
| 对齐 | 居中 | - |

### 4.2 网格基础参数（实测 iTab）

| 参数 | 值 | 说明 |
|------|----|------|
| 基础格大小 | 60px | 每格宽高均为 60px |
| 格间距 | 30px | column-gap / row-gap 均为 30px |
| 总列数 | 14 列 | 默认网格 14 列（实测） |
| 网格总宽 | 1250px | 14×60 + 13×30 = 1230px（含 padding） |

### 4.3 尺寸映射（size 格式：行数x列数）

> **计算公式**：`实际像素 = n × 60 + (n-1) × 30`

| size 值 | 列 span | 行 span | 实际宽 px | 实际高 px | 适用类型 | 页面实测 |
|---------|---------|---------|-----------|-----------|----------|---------|
| 1x1 | 1 | 1 | 60 | 60 | 普通网站图标、文件夹 | ✅ 出现 16 个 |
| 1x2 | 2 | 1 | 150 | 60 | 宽横幅图标（爱奇艺、ChatExcel） | ✅ 出现 2 个 |
| 1x3 | 3 | 1 | 240 | 60 | 超宽横幅（可选） | 未见，理论可用 |
| 1x4 | 4 | 1 | 330 | 60 | 超宽横幅（可选） | 未见，理论可用 |
| 2x1 | 1 | 2 | 60 | 150 | 高竖幅图标（稿定设计） | ✅ 出现 1 个 |
| 2x2 | 2 | 2 | 150 | 150 | 标准小组件（天气/日历/纪念日） | ✅ 出现 8 个 |
| 2x3 | 3 | 2 | 240 | 150 | 中号组件（可选） | 未见，理论可用 |
| 2x4 | 4 | 2 | 330 | 150 | 大组件（热搜/倒计时/待办） | ✅ 出现 5 个 |

**右键菜单可选尺寸**（实测 `.contextmenu-layout`）：`1x1 | 1x2 | 2x1 | 2x2 | 2x4`

### 4.4 尺寸调整交互（右键菜单）

| 步骤 | 交互 |
|------|------|
| 右键点击图标或组件 | 弹出右键菜单 |
| 菜单中"布局"行 | 显示横排尺寸按钮：`1x1` `1x2` `2x1` `2x2` `2x4` |
| 点击尺寸按钮 | 当前选中项高亮（active class），立即更新 store 中该 item 的 size |
| 网格自动重排 | 通过 `grid-column: span N; grid-row: span N` 实现 |

### 4.5 网格内容

- 合并 widgets（组件）和 icons（图标）按 order 排序渲染
- 组件用对应 Widget 组件渲染（含 WidgetWrapper 外壳）
- 图标用 IconItem 渲染
- 文件夹用 IconFolder 渲染

---

## 五、图标（IconItem）

### 5.1 图标渲染

| 类型 | 渲染方式 |
|------|----------|
| URL 图标 | `<img src="icon">` 居中，bgColor 背景 |
| 文字图标 | 名称首字母大写居中，bgColor 背景 |
| 上传图标 | `<img src="base64">` 居中 |

### 5.2 图标样式

| 属性 | 说明 | 可设置 |
|------|------|--------|
| 大小 | 默认 60px | 40-80px |
| 圆角 | 默认 18px | 0-50px |
| 透明度 | 默认 1 | 0-1 |
| 样式 | 默认（方形圆角） / 圆形 | 可切换 |
| 名称显示 | 默认显示 | 可关闭 |
| 名称字号 | 默认 12px | 10-18px |
| 名称颜色 | 默认 #ffffff | 预设色板 + 自定义 |

### 5.3 图标交互

| 操作 | 行为 |
|------|------|
| 单击 | 打开 URL（新标签页或当前页，可设置） |
| hover | scale(1.05) 放大，transition 200ms |
| 右键 | 弹出右键菜单 |
| 拖拽 | 自由拖拽换位 |

### 5.4 图标数据结构

```typescript
interface SiteIcon {
  id: string            // 唯一标识
  name: string          // 显示名称
  url: string           // 跳转链接
  icon: string          // 图片 URL（空时走文字图标逻辑）
  iconText?: string     // 自定义文字图标（1-2字符，优先级高于 name 首字母）
  bgColor: string       // 背景色 hex
  size: IconSize        // '1x1' | '1x2' | '2x1' | '2x2' | '2x4'
  type: 'site' | 'folder' | 'builtin'
  order: number         // 排序序号
  groupId: string       // 所属分组 ID
  children?: SiteIcon[] // 文件夹子项
  openInNewTab?: boolean
}
```

### 5.5 图标尺寸调整

- 右键菜单「布局」行提供 5 个尺寸按钮：`1x1` / `1x2` / `2x1` / `2x2` / `2x4`
- 当前尺寸高亮显示，点击后调用 `iconsStore.updateIconSize(id, newSize)`
- 图标本体视觉大小随 size 动态缩放（见 `iconScale` 计算逻辑）

---

## 六、文件夹（IconFolder）

### 6.1 文件夹图标

| 属性 | 说明 |
|------|------|
| 背景 | 毛玻璃 blur(10px) + rgba(255,255,255,0.6) |
| 内部 | 2x2 迷你网格，展示前 4 个子图标缩略图 |
| 底部 | 文件夹名称 |

### 6.2 文件夹弹窗

| 属性 | 说明 |
|------|------|
| 样式 | Popover 风格，非全屏 |
| 背景 | 毛玻璃 glass-card |
| 标题 | 文件夹名称 |
| 内容 | 网格展示所有子图标 |
| 子图标 | 可点击跳转 URL |
| 关闭 | 点击外部关闭 |

---

## 七、右键菜单（ContextMenu）

### 7.1 菜单样式

| 属性 | 说明 |
|------|------|
| 定位 | fixed，鼠标位置 |
| 背景 | 毛玻璃 blur(10px) + rgba(11,11,11,0.7) |
| 圆角 | 12px |
| 最小宽度 | 160px |
| 文字颜色 | 白色 |
| 阴影 | box-shadow |

### 7.2 菜单项

| 菜单项 | 图标 | 行为 | 适用对象 |
|--------|------|------|----------|
| 在新标签页打开 | mdi:open-in-new | window.open(url, '_blank') | icon |
| 布局 | mdi:view-grid-outline | 5 个尺寸按钮，当前高亮，点击切换 | icon, widget |
| 编辑图标 | mdi:pencil-outline | 打开 IconEditor 弹窗 | icon |
| 删除 | mdi:delete-outline（红色） | 确认后从 store 移除 | icon, widget |

### 7.3 布局子菜单

内联显示 5 个尺寸选项：
- `1x1` `1x2` `2x1` `2x2` `2x4`
- 当前尺寸高亮
- 点击立即切换（调用 updateIconSize 或 updateWidget）

---

## 八、拖拽排序

### 8.1 图标拖拽

| 属性 | 说明 |
|------|------|
| 库 | vue-draggable-plus |
| 动画 | 150ms |
| 拖拽占位 | 半透明 + 虚线边框（ghostClass） |
| 拖中样式 | scale(1.05) + 阴影（chosenClass） |
| 持久化 | 拖拽结束更新 order → 自动持久化 |

### 8.2 侧边栏分组拖拽

- 分组列表支持上下拖拽排序
- 拖拽结束更新 groupsStore.reorderGroups()

---

## 九、小组件系统

### 9.1 小组件通用容器（WidgetWrapper）

| 属性 | 说明 |
|------|------|
| 圆角 | var(--icon-radius) |
| 溢出 | hidden |
| 网格 span | 根据 size 设置 |
| 右键菜单 | 支持 |

### 9.2 天气组件（WeatherWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x2 |
| 数据 | 城市/温度/天气描述/最高温/最低温/AQI |
| API | wttr.in 或和风天气 |
| 缓存 | 30 分钟 |
| 背景 | 暖色渐变 |
| 布局 | 左上城市名，中间温度大字，下方 AQI + 温度范围 |

### 9.3 日历组件（CalendarWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x2 |
| 布局 | 顶部年月徽章，中间日期大字，底部周数+农历+星期 |
| 计算 | dayjs dayOfYear / isoWeek + 农历算法 |
| 样式 | 橙色/绿色强调色 |

### 9.4 热搜榜组件（HotSearchWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x4 |
| 数据源 | 百度 / 微博 / 抖音（标签切换） |
| 列表项 | 序号 + 标题 + 热度值 |
| 序号颜色 | 前 3 名：红/橙/黄，其余灰色 |
| 交互 | 点击跳转搜索 |
| 缓存 | 10 分钟 |
| 背景 | 白色半透明 |

### 9.5 下班倒计时组件（CountdownWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x4 |
| 左侧 | "下班还有" + HH:MM:SS 实时倒计时 |
| 右侧 | 发薪日倒计时 / 最近节日倒计时 / 今日收入 |
| 更新频率 | 每秒 |
| 可配置 | 下班时间(18:00) / 月薪(10000) / 发薪日(10号) |
| 计算 | 倒计时 = offWork - now, 收入 = 月薪/工作日数 × 已过工时/8 |

### 9.6 备忘录组件（MemoWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x2 |
| 标题 | "备忘录"，绿色渐变背景 |
| 内容 | 可编辑文本区域 |
| 保存 | 自动保存（debounce 500ms）到 widget config |
| 文字 | 白色 |

### 9.7 电影日历组件（MovieWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x2 |
| 背景 | 电影海报全背景 |
| 遮罩 | 底部渐变（transparent → rgba(0,0,0,0.8)） |
| 内容 | 日期 + 电影名 + 豆瓣评分 + 经典台词 |
| 数据 | 7 部硬编码，按星期几轮换 |

### 9.8 纪念日组件（AnniversaryWidget）

| 属性 | 说明 |
|------|------|
| 尺寸 | 2x2 |
| 标题 | "你在世界已经" |
| 内容 | 天数大字 + 起始日期 |
| 可配置 | 纪念日名称 / 起始日期 |
| 计算 | dayjs().diff(startDate, 'day') |

---

## 十、设置弹窗（SettingsDialog）

### 10.1 弹窗样式

| 属性 | 说明 |
|------|------|
| 类型 | 右侧抽屉 |
| 宽度 | 320px |
| z-index | 100 |
| 背景 | 毛玻璃 glass-dialog |
| 动画 | 从右滑入（translateX 100% → 0） |
| 布局 | 左侧菜单（~100px） + 右侧内容区 |

### 10.2 设置菜单

| 菜单项 | 图标 | 对应设置 |
|--------|------|----------|
| 搜索栏 | mdi:magnify | search.* |
| 图标 | mdi:apps | icon.* |
| 时间/日期 | mdi:clock-outline | time.* |
| 主题/壁纸 | mdi:palette-outline | theme.* + wallpaper.* |
| 布局 | mdi:view-dashboard-outline | layout.* |
| 侧边栏 | mdi:dock-left | sidebar.* |
| 备份与恢复 | mdi:cloud-sync-outline | 导入/导出 |
| 重置设置 | mdi:refresh | 全部重置 |
| 关于 | mdi:information-outline | 版本信息 |

### 10.3 各面板设置项明细

#### 搜索栏面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 显示搜索栏 | Switch | on/off | on | search.show |
| 搜索栏高度 | Slider | 30-60px | 46 | search.height |
| 搜索栏圆角 | Slider | 0-30px | 23 | search.radius |
| 背景透明度 | Slider | 0-1 | 0.5 | search.bgColor |

#### 图标面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 图标样式 | 按钮组 | 默认/圆形 | 默认 | icon.style |
| 图标大小 | Slider | 40-80px | 60 | icon.iconSize |
| 图标圆角 | Slider | 0-50px | 18 | icon.iconRadius |
| 不透明度 | Slider | 0-1 | 1 | icon.opacity |
| 间距 | Slider | 10-60px | 30 | icon.gapX/gapY |
| 间距同步 | Switch | on/off | on | icon.gapSync |
| 名称显示 | Switch | on/off | on | icon.nameShow |
| 名称字号 | Slider | 10-18px | 12 | icon.nameSize |
| 名称颜色 | 色板 | 预设+自定义 | #fff | icon.nameColor |
| 最大宽度 | Input | 数字 | 1350 | icon.maxWidth |
| 宽度单位 | 按钮组 | px/% | px | icon.maxWidthUnit |

#### 时间/日期面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 显示时钟 | Switch | on/off | on | time.show |
| 字号大小 | Slider | 40-120px | 70 | time.size |
| 24 小时制 | Switch | on/off | on | time.hour24 |
| 显示秒 | Switch | on/off | off | time.sec |
| 显示月份 | Switch | on/off | on | time.month |
| 显示星期 | Switch | on/off | on | time.week |
| 显示农历 | Switch | on/off | on | time.lunar |
| 时钟颜色 | Color | hex | #fff | time.color |

#### 主题/壁纸面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 主题模式 | 按钮组 | 浅色/深色 | 浅色 | theme.mode |
| 跟随系统 | Switch | on/off | on | theme.system |
| 壁纸遮罩 | Slider | 0-1 | 0 | wallpaper.mask |
| 壁纸模糊 | Slider | 0-30px | 0 | wallpaper.blur |
| 壁纸来源 | 按钮组 | 默认/URL/本地 | 默认 | wallpaper.type |
| 壁纸 URL | Input | URL | 默认壁纸 | wallpaper.src |

#### 布局面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 视图模式 | 按钮组 | 组件/简洁 | 组件 | layout.view |
| 显示一言 | Switch | on/off | on | layout.yiyan |

#### 侧边栏面板

| 设置项 | 控件 | 范围 | 默认值 | 绑定字段 |
|--------|------|------|--------|----------|
| 位置 | 按钮组 | 左/右 | 左 | sidebar.placement |
| 自动隐藏 | Switch | on/off | off | sidebar.autoHide |
| 宽度 | Slider | 40-80px | 50 | sidebar.width |
| 透明度 | Slider | 0-1 | 0.4 | sidebar.opacity |

#### 备份与恢复面板

| 功能 | 说明 |
|------|------|
| 导出 | 序列化所有 store 数据 → JSON 文件下载（aitabs-backup.json） |
| 导入 | 文件选择器 → 读取 JSON → 写入各 store → 刷新页面 |

#### 重置设置面板

| 功能 | 说明 |
|------|------|
| 重置按钮 | 弹出确认弹窗 → 清空所有 store → 恢复默认数据 |

---

## 十一、添加弹窗（AddDialog）

### 11.1 弹窗样式

| 属性 | 说明 |
|------|------|
| 尺寸 | 80vw × 70vh |
| 位置 | 屏幕居中 |
| 背景 | 毛玻璃模糊 |
| 布局 | 左侧 Tab 栏 + 右侧内容区 |

### 11.2 小组件 Tab

**分类标签**：探索 / 全部 / 效率 / 工具 / 开发 / 设计 / 创意 / 娱乐 / 其他

**排序方式**：今日推荐 / 最近更新 / 最受欢迎

**可添加组件**：

| 组件 | 尺寸 | 分类 | 描述 |
|------|------|------|------|
| 天气 | 2x2 | 效率 | 实时天气信息 |
| 日历 | 2x2 | 效率 | 公历+农历日期 |
| 热搜榜 | 2x4 | 效率 | 百度/微博/抖音热搜 |
| 下班倒计时 | 2x4 | 效率 | 下班/发薪/节日倒计时 |
| 备忘录 | 2x2 | 效率 | 快速记录 |
| 电影日历 | 2x2 | 娱乐 | 每日电影推荐 |
| 纪念日 | 2x2 | 效率 | 重要日期纪念 |

**卡片内容**：图标 + 名称 + 描述 + 安装量 + "添加"按钮

### 11.3 网址导航 Tab

**分类标签**：浏览器 / AI / 应用 / 新闻 / 科技 / 效率 / 学习 / 购物 / 社交 / 阅读 / 设计 / 金融 / 其他

**预设网站**（20+）：

| 名称 | URL | 图标 CDN | 背景色 | 分类 |
|------|-----|----------|--------|------|
| 百度 | baidu.com | icons/baidu.svg | #346efd | 浏览器 |
| Google | google.com | icons/google.svg | #4285f4 | 浏览器 |
| GitHub | github.com | icons/github.svg | #333333 | 开发 |
| 哔哩哔哩 | bilibili.com | icons/bilibili.svg | #01affd | 娱乐 |
| 知乎 | zhihu.com | icons/zhihu.svg | #0066ff | 社交 |
| 淘宝 | taobao.com | icons/taobao.svg | #f52324 | 购物 |
| 京东 | jd.com | icons/jd.svg | #ff0000 | 购物 |
| 微博 | weibo.com | icons/weibo.svg | #e6162d | 社交 |
| 抖音 | douyin.com | icons/douyin.svg | #1c0b1a | 娱乐 |
| 掘金 | juejin.cn | icons/juejin.svg | #0984fe | 开发 |
| ChatGPT | chat.openai.com | - | #10a37f | AI |
| ... | ... | ... | ... | ... |

**卡片内容**：图标 + 名称 + 描述 + 外链图标 + "添加"按钮

### 11.4 自定义图标 Tab

| 字段 | 控件 | 说明 |
|------|------|------|
| 地址 | Input + "获取图标"按钮 | 输入 URL，点击获取自动填充 |
| 名称 | Input | 自动填充或手动输入 |
| 图标颜色 | 色板（20 色 + 自定义） | 自动填充 API 返回的 backgroundColor |
| 图标文字 | Input | 默认取名称首字母 |
| 图标来源 | 切换按钮：文字图标 / 上传 | - |
| 预览 | 实时预览区 | 展示最终效果 |
| 操作 | "保存" + "保存并继续" | 保存后关闭 or 清空继续添加 |

**获取图标 API**：

```
GET https://api.codelife.cc/website/info?lang=cn&url={网址}

Response: {
  "code": 200,
  "data": {
    "name": "掘金",
    "src": "https://files.codelife.cc/icons/juejin.svg",
    "imgSrc": "https://files.codelife.cc/icons/juejin.svg",
    "backgroundColor": "#0984fe"
  }
}
```

---

## 十二、图标编辑（IconEditor）

### 12.1 编辑弹窗

| 属性 | 说明 |
|------|------|
| 类型 | Element Plus ElDialog |
| 触发 | 右键菜单"编辑图标" |

### 12.2 可编辑字段

| 字段 | 控件 | 说明 |
|------|------|------|
| URL | Input + "获取图标" | 修改链接，可重新获取图标 |
| 名称 | Input | 修改显示名称 |
| 图标 | 自动获取/上传/文字图标 | 三种来源切换 |
| 背景色 | 色板 | 20 预设色 + 自定义 |
| 尺寸 | 5 个按钮 | 1x1/1x2/2x1/2x2/2x4 |
| 打开方式 | Switch | 新标签页/当前页 |

---

## 十三、数据持久化

### 13.1 存储方案

| 数据 | 存储位置 | Key |
|------|----------|-----|
| 全局设置 | localStorage | aitabs-settings |
| 分组数据 | localStorage | aitabs-groups |
| 图标数据 | localStorage | aitabs-icons |
| 组件数据 | localStorage | aitabs-widgets |
| 数据版本 | localStorage | aitabs-version |

### 13.2 默认数据

首次访问时（localStorage 无对应 key），自动初始化：
- 6 个默认分组
- 10 个常用网站图标
- 4 个默认组件（天气/日历/热搜/倒计时）
- 完整默认设置

### 13.3 数据版本管理

- 当前版本：`1`
- 版本升级时执行迁移逻辑（预留）

---

## 十四、PWA

### 14.1 Manifest

| 属性 | 值 |
|------|-----|
| name | AItabs - 新标签页 |
| short_name | AItabs |
| theme_color | #1890ff |
| background_color | #000000 |
| display | standalone |
| icons | 192x192 + 512x512 |

### 14.2 Service Worker

- 缓存策略：静态资源（JS/CSS/图片）预缓存
- 运行时缓存：API 请求 stale-while-revalidate
- 离线可用

---

## 十五、外部 API 汇总

| API | 用途 | URL | 认证 |
|-----|------|-----|------|
| 网站图标 | 获取网站名称和图标 | `api.codelife.cc/website/info?lang=cn&url=` | 无 |
| 天气 | 实时天气数据 | `wttr.in/?format=j1` 或和风天气 | 无/API Key |
| 热搜 | 百度/微博/抖音热搜 | 公开 API 或后端代理 | 无 |

---

## 十六、CSS 变量完整清单

| 变量名 | 默认值 | 说明 | 设置面板 |
|--------|--------|------|----------|
| --wall-blur | 0px | 壁纸模糊度 | 主题/壁纸 |
| --wall-mask | 0 | 壁纸遮罩透明度 | 主题/壁纸 |
| --dialog-blur | blur(10px) | 弹窗模糊度 | - |
| --icon-size | 60px | 图标大小 | 图标 |
| --icon-gap | 30px | 图标间距 | 图标 |
| --icon-radius | 18px | 图标圆角 | 图标 |
| --icon-opacity | 1 | 图标透明度 | 图标 |
| --icon-name-size | 12px | 名称字号 | 图标 |
| --icon-name-color | #fff | 名称颜色 | 图标 |
| --sidebar-width | 50px | 侧边栏宽度 | 侧边栏 |
| --sidebar-opacity | 0.4 | 侧边栏透明度 | 侧边栏 |
| --search-height | 46px | 搜索栏高度 | 搜索栏 |
| --search-radius | 23px | 搜索栏圆角 | 搜索栏 |
| --search-bg-color | 0.5 | 搜索栏背景透明度 | 搜索栏 |
| --time-size | 70px | 时钟字号 | 时间/日期 |
| --time-color | #fff | 时钟颜色 | 时间/日期 |
| --time-font-weight | 400 | 时钟字重 | - |
| --time-font | system-ui | 时钟字体 | - |
| --img-bg | 38,64,85 | 主题色 RGB | - |
| --img-text | 233,233,233 | 文字色 RGB | - |
