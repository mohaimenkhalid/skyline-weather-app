const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

export async function fetchForecast({ lat, lon }, signal) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover',
    hourly: 'temperature_2m,weather_code,precipitation_probability,cloud_cover',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '8',
  })
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Forecast request failed (${res.status})`)
  return shapeForecast(await res.json())
}

function shapeForecast(d) {
  const cur = d.current
  const { hourly, daily } = d

  const sunByDate = {}
  daily.time.forEach((day, i) => {
    sunByDate[day] = { sunrise: daily.sunrise[i], sunset: daily.sunset[i] }
  })

  // Hourly times are local to the place; match the current hour by string.
  let start = hourly.time.findIndex((t) => t.slice(0, 13) === cur.time.slice(0, 13))
  if (start < 0) start = 0

  const hours = []
  for (let k = 0; k <= 24; k++) {
    const i = start + k
    if (i >= hourly.time.length) break
    const time = k === 0 ? cur.time : hourly.time[i]
    hours.push({
      time,
      temp: k === 0 ? cur.temperature_2m : hourly.temperature_2m[i],
      code: k === 0 ? cur.weather_code : hourly.weather_code[i],
      cloud: k === 0 ? cur.cloud_cover : hourly.cloud_cover[i],
      pop: hourly.precipitation_probability[i] ?? 0,
      sun: sunByDate[time.slice(0, 10)],
    })
  }

  const days = daily.time.slice(0, 7).map((date, i) => ({
    date,
    code: daily.weather_code[i],
    max: daily.temperature_2m_max[i],
    min: daily.temperature_2m_min[i],
    pop: daily.precipitation_probability_max[i] ?? 0,
    uv: daily.uv_index_max[i],
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }))

  return {
    current: {
      time: cur.time,
      temp: cur.temperature_2m,
      feels: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      windSpeed: cur.wind_speed_10m,
      windDir: cur.wind_direction_10m,
      pressure: cur.pressure_msl,
      code: cur.weather_code,
    },
    hours,
    days,
  }
}

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({ name: query, count: '6', language: 'en', format: 'json' })
  const res = await fetch(`${GEOCODE_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export async function reverseGeocode(lat, lon) {
  try {
    const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: 'en' })
    const res = await fetch(`${REVERSE_URL}?${params}`)
    const d = await res.json()
    return {
      name: d.city || d.locality || 'Your location',
      region: [d.principalSubdivision, d.countryName].filter(Boolean).join(', '),
    }
  } catch {
    return { name: 'Your location', region: '' }
  }
}
