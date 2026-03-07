/**
 * 天气组件类型定义
 */

/**
 * 天气配置
 */
export interface WeatherConfig {
  /** 城市名称（留空则自动定位） */
  city: string
  /** 温度单位 */
  unit: 'celsius' | 'fahrenheit'
}

/**
 * 天气数据
 */
export interface WeatherData {
  /** 配置 */
  config: WeatherConfig
}

/**
 * 默认配置
 */
export const DEFAULT_WEATHER_CONFIG: WeatherConfig = {
  city: '',
  unit: 'celsius',
}
