/**
 * 纪念日组件类型定义
 */

/**
 * 纪念日配置
 */
export interface AnniversaryConfig {
  /** 起始日期 (YYYY-MM-DD 格式) */
  startDate: string
  /** 标题文字 */
  title: string
}

/**
 * 纪念日数据
 */
export interface AnniversaryData {
  /** 配置 */
  config: AnniversaryConfig
}

/**
 * 默认配置
 */
export const DEFAULT_ANNIVERSARY_CONFIG: AnniversaryConfig = {
  startDate: '1997-10-01',
  title: '你在世界已经',
}
