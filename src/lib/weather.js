// WMO weather codes → what the sky should look like.
// grey: how much the sky is washed out (0 clear → 1 storm)
// precip: particle type drawn over the sky; intensity 0–1
const CODES = {
  0: ['Clear sky', 'clear', 0],
  1: ['Mostly clear', 'partly', 0.1],
  2: ['Partly cloudy', 'partly', 0.3],
  3: ['Overcast', 'cloudy', 0.75],
  45: ['Fog', 'fog', 0.7],
  48: ['Freezing fog', 'fog', 0.75],
  51: ['Light drizzle', 'drizzle', 0.6, 'drizzle', 0.3],
  53: ['Drizzle', 'drizzle', 0.65, 'drizzle', 0.5],
  55: ['Heavy drizzle', 'drizzle', 0.7, 'drizzle', 0.7],
  56: ['Freezing drizzle', 'drizzle', 0.7, 'drizzle', 0.4],
  57: ['Freezing drizzle', 'drizzle', 0.75, 'drizzle', 0.6],
  61: ['Light rain', 'rain', 0.7, 'rain', 0.4],
  63: ['Rain', 'rain', 0.8, 'rain', 0.7],
  65: ['Heavy rain', 'rain', 0.9, 'rain', 1],
  66: ['Freezing rain', 'rain', 0.8, 'rain', 0.5],
  67: ['Freezing rain', 'rain', 0.85, 'rain', 0.8],
  71: ['Light snow', 'snow', 0.6, 'snow', 0.4],
  73: ['Snow', 'snow', 0.7, 'snow', 0.7],
  75: ['Heavy snow', 'snow', 0.8, 'snow', 1],
  77: ['Snow grains', 'snow', 0.65, 'snow', 0.4],
  80: ['Light showers', 'rain', 0.6, 'rain', 0.45],
  81: ['Showers', 'rain', 0.7, 'rain', 0.75],
  82: ['Violent showers', 'rain', 0.9, 'rain', 1],
  85: ['Snow showers', 'snow', 0.65, 'snow', 0.5],
  86: ['Heavy snow showers', 'snow', 0.8, 'snow', 0.9],
  95: ['Thunderstorm', 'storm', 1, 'storm', 0.85],
  96: ['Thunderstorm with hail', 'storm', 1, 'storm', 0.95],
  99: ['Thunderstorm with hail', 'storm', 1, 'storm', 1],
}

export function describe(code, isNight = false) {
  const [label, kind, grey, precip = null, intensity = 0] = CODES[code] || ['Unknown', 'cloudy', 0.5]
  return {
    label: isNight && code === 0 ? 'Clear night' : label,
    kind,
    grey,
    precip,
    intensity,
  }
}

const WET_WORD = { drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', storm: 'Storms' }

export const toUnit = (c, unit) => (unit === 'F' ? c * 1.8 + 32 : c)
export const deg = (c, unit) => `${Math.round(toUnit(c, unit))}°`

// Times from Open-Meteo are local to the place and carry no offset.
// We only read their parts, so the viewer's own timezone never leaks in.
export function hourLabel(iso) {
  const h = Number(iso.slice(11, 13))
  const suffix = h < 12 ? 'AM' : 'PM'
  return `${h % 12 || 12} ${suffix}`
}

export function clockLabel(iso) {
  const h = Number(iso.slice(11, 13))
  const m = iso.slice(14, 16)
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
}

export function dayLabel(date, index) {
  if (index === 0) return 'Today'
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

// One plain sentence about what the next 24 hours hold.
export function summarize(hours, today, unit) {
  const wet = (h) => describe(h.code).precip
  const now = wet(hours[0])
  let line

  if (now) {
    const dryAt = hours.findIndex((h) => !wet(h))
    line =
      dryAt > 0
        ? `${WET_WORD[now]} easing around ${hourLabel(hours[dryAt].time)}.`
        : `${WET_WORD[now]} continuing through tomorrow.`
  } else {
    const wetAt = hours.findIndex((h) => wet(h))
    const maxPop = Math.max(...hours.map((h) => h.pop))
    if (wetAt > 0) line = `${WET_WORD[wet(hours[wetAt])]} likely from ${hourLabel(hours[wetAt].time)}.`
    else if (maxPop >= 40) line = 'A chance of showers later.'
    else line = 'Dry for the next 24 hours.'
  }

  return `${line} High ${deg(today.max, unit)}, low ${deg(today.min, unit)}.`
}
