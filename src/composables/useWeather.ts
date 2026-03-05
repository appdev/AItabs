import { ref, onMounted, watch } from 'vue'

const CACHE_KEY_PREFIX = 'aitabs-weather-'
const CACHE_TTL = 30 * 60 * 1000

interface WeatherCache {
  city: string
  temp: number
  tempF: number
  desc: string
  high: number
  highF: number
  low: number
  lowF: number
  weatherCode: string
  aqi: string
  timestamp: number
}

// Open-Meteo 天气码 → MDI 图标映射（WMO Weather interpretation codes）
function codeToIcon(code: string | number): string {
  const n = Number(code)
  if (n === 0) return 'mdi:weather-sunny'
  if (n <= 2) return 'mdi:weather-partly-cloudy'
  if (n === 3) return 'mdi:weather-cloudy'
  if (n >= 45 && n <= 48) return 'mdi:weather-fog'
  if (n >= 51 && n <= 67) return 'mdi:weather-rainy'
  if (n >= 71 && n <= 77) return 'mdi:weather-snowy'
  if (n >= 80 && n <= 82) return 'mdi:weather-pouring'
  if (n >= 85 && n <= 86) return 'mdi:weather-snowy-heavy'
  if (n >= 95 && n <= 99) return 'mdi:weather-lightning-rainy'
  return 'mdi:weather-partly-cloudy'
}

// WMO 天气码 → 中文描述
function codeToDesc(code: string | number): string {
  const n = Number(code)
  if (n === 0) return '晴天'
  if (n === 1) return '大部晴朗'
  if (n === 2) return '多云'
  if (n === 3) return '阴天'
  if (n >= 45 && n <= 48) return '雾'
  if (n >= 51 && n <= 53) return '小雨'
  if (n >= 55 && n <= 57) return '中雨'
  if (n >= 61 && n <= 63) return '小到中雨'
  if (n >= 65 && n <= 67) return '大雨'
  if (n >= 71 && n <= 73) return '小雪'
  if (n >= 75 && n <= 77) return '大雪'
  if (n >= 80 && n <= 82) return '阵雨'
  if (n >= 85 && n <= 86) return '阵雪'
  if (n >= 95 && n <= 99) return '雷阵雨'
  return '多云'
}

function toF(c: number) { return Math.round(c * 9 / 5 + 32) }

// 获取 AQI（aqicn.org demo token，失败返回 '--'）
async function fetchAqi(): Promise<string> {
  try {
    const res = await fetch('https://api.waqi.info/feed/here/?token=demo')
    if (!res.ok) return '--'
    const json = await res.json()
    if (json.status === 'ok' && json.data?.aqi != null) return String(json.data.aqi)
  } catch { /* 忽略，不影响主要天气 */ }
  return '--'
}

// 用 ip-api.com 获取大概经纬度
async function fetchIpLocation(): Promise<{ lat: number; lon: number; city: string }> {
  try {
    const res = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=lat,lon,city')
    if (!res.ok) throw new Error()
    const data = await res.json()
    return { lat: data.lat ?? 39.9, lon: data.lon ?? 116.4, city: data.city ?? '当前位置' }
  } catch {
    return { lat: 39.9, lon: 116.4, city: '当前位置' }
  }
}

// Open-Meteo geocoding 用城市名获取坐标
async function geocodeCity(name: string): Promise<{ lat: number; lon: number; city: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=zh&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const r = data.results?.[0]
    if (!r) return null
    return { lat: r.latitude, lon: r.longitude, city: r.name ?? name }
  } catch {
    return null
  }
}

export function useWeather(options?: { cityRef?: () => string; unitRef?: () => 'celsius' | 'fahrenheit' }) {
  const city = ref('--')
  const temp = ref('--')
  const desc = ref('--')
  const high = ref('--')
  const low = ref('--')
  const aqi = ref('--')
  const weatherIcon = ref('mdi:weather-partly-cloudy')
  const loading = ref(false)
  const error = ref(false)

  const cityOverride = options?.cityRef
  const unitOverride = options?.unitRef

  function applyCache(cache: Omit<WeatherCache, 'timestamp'>, unit: 'celsius' | 'fahrenheit') {
    city.value = cache.city
    if (unit === 'fahrenheit') {
      temp.value = String(cache.tempF)
      high.value = String(cache.highF)
      low.value = String(cache.lowF)
    } else {
      temp.value = String(cache.temp)
      high.value = String(cache.high)
      low.value = String(cache.low)
    }
    desc.value = cache.desc
    aqi.value = cache.aqi
    weatherIcon.value = codeToIcon(cache.weatherCode)
  }

  async function refresh() {
    const cityName = cityOverride?.() ?? ''
    const unit = unitOverride?.() ?? 'celsius'
    const cacheKey = CACHE_KEY_PREFIX + (cityName || 'auto')

    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const parsed: WeatherCache = JSON.parse(raw)
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          applyCache(parsed, unit)
          return
        }
      }
    } catch { /* 缓存损坏 */ }

    loading.value = true
    error.value = false
    try {
      let location: { lat: number; lon: number; city: string }

      if (cityName.trim()) {
        const geo = await geocodeCity(cityName.trim())
        location = geo ?? await fetchIpLocation()
      } else {
        location = await fetchIpLocation()
      }

      const { lat, lon } = location
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`

      const [weatherRes, aqiStr] = await Promise.all([fetch(url), fetchAqi()])
      if (!weatherRes.ok) throw new Error(`HTTP ${weatherRes.status}`)
      const data = await weatherRes.json()

      const current = data.current ?? {}
      const daily = data.daily ?? {}
      const code = current.weathercode ?? 0
      const tempC = Math.round(current.temperature_2m ?? 0)
      const highC = Math.round(daily.temperature_2m_max?.[0] ?? 0)
      const lowC = Math.round(daily.temperature_2m_min?.[0] ?? 0)

      const cache: WeatherCache = {
        city: location.city,
        temp: tempC,
        tempF: toF(tempC),
        desc: codeToDesc(code),
        high: highC,
        highF: toF(highC),
        low: lowC,
        lowF: toF(lowC),
        weatherCode: String(code),
        aqi: aqiStr,
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cache))
      applyCache(cache, unit)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
  })

  // 如果城市或单位变化，重新加载
  if (cityOverride || unitOverride) {
    watch([cityOverride ?? (() => ''), unitOverride ?? (() => 'celsius')], () => {
      refresh()
    })
  }

  return { city, temp, desc, high, low, aqi, weatherIcon, loading, error, refresh }
}
