import { motion } from 'motion/react'
import { clockLabel, deg } from '../lib/weather'

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function uvWord(uv) {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Extreme'
}

export default function Details({ current, today, unit }) {
  const windFrom = COMPASS[Math.round(current.windDir / 45) % 8]

  return (
    <section className="details" aria-labelledby="details-title">
      <h2 id="details-title">Right now</h2>
      <dl>
        <div>
          <dt>Feels like</dt>
          <dd>{deg(current.feels, unit)}</dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd className="wind">
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              initial={{ rotate: 0 }}
              animate={{ rotate: current.windDir + 180 }}
              transition={{ type: 'spring', stiffness: 60, damping: 8, delay: 0.6 }}
              aria-hidden="true"
            >
              <path d="M12 3l5 15-5-3-5 3 5-15Z" fill="currentColor" />
            </motion.svg>
            {Math.round(unit === 'F' ? current.windSpeed * 0.621 : current.windSpeed)}
            <small>{unit === 'F' ? 'mph' : 'km/h'} from {windFrom}</small>
          </dd>
        </div>
        <div>
          <dt>UV index</dt>
          <dd>
            {Math.round(today.uv)} <small>{uvWord(today.uv)}</small>
          </dd>
        </div>
        <div>
          <dt>Sunrise</dt>
          <dd>{clockLabel(today.sunrise)}</dd>
        </div>
        <div>
          <dt>Sunset</dt>
          <dd>{clockLabel(today.sunset)}</dd>
        </div>
        <div>
          <dt>Chance of rain</dt>
          <dd>{today.pop}%</dd>
        </div>
        <div>
          <dt>Pressure</dt>
          <dd>
            {Math.round(current.pressure)} <small>hPa</small>
          </dd>
        </div>
      </dl>
    </section>
  )
}
