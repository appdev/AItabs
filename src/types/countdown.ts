/**
 * 倒计时组件类型定义
 */

/**
 * 倒计时配置
 */
export interface CountdownConfig {
  /** 下班时间 (HH:mm 格式) */
  offWorkTime: string
  /** 月薪 */
  salary: number
  /** 发薪日 */
  payDay: number
  /** 显示选项 */
  display: {
    /** 显示下班倒计时 */
    showOffWork: boolean
    /** 显示薪资倒计时 */
    showSalary: boolean
    /** 显示假期倒计时 */
    showHoliday: boolean
    /** 显示今日收入 */
    showIncome: boolean
  }
  /** 假期配置 */
  holiday?: {
    /** 假期名称 */
    name: string
    /** 假期日期 (YYYY-MM-DD) */
    date: string
  }
}

/**
 * 倒计时数据
 */
export interface CountdownData {
  /** 配置 */
  config: CountdownConfig
}

/**
 * 默认配置
 */
export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
  offWorkTime: '18:00',
  salary: 10000,
  payDay: 10,
  display: {
    showOffWork: true,
    showSalary: true,
    showHoliday: true,
    showIncome: true,
  },
  holiday: {
    name: '',
    date: '',
  },
}
