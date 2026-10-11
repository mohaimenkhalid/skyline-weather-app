import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react'
import Sky from './components/Sky'
import Precipitation from './components/Precipitation'
import Search from './components/Search'
import HourlyScrubber from './components/HourlyScrubber'
import Daily from './components/Daily'
import Details from './components/Details'
import { fetchForecast, reverseGeocode } from './lib/api'
import { describe, hourLabel, summarize, toUnit } from './lib/weather'
import { sunPhase } from './lib/sky'

const DEFAULT_PLACE = { name: 'Dhaka', region: 'Dhaka Division, Bangladesh', lat: 23.8103, lon: 90.4125 }

const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable: preferences just won't persist */
    }
  },
}

// A believable sky to show while the first forecast loads.
function placeholderHour() {
  const pad = (n) => String(n).padStart(2, '0')
  const d = new Date()
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return {
    time: `${day}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    temp: 0,
    code: 1,
    cloud: 20,
    pop: 0,
    sun: { sunrise: `${day}T06:00`, sunset: `${day}T18:00` },
  }
}

function Temperature({ value }) {
  const spring = useSpring(0, { stiffness: 70, damping: 16 })
  const rounded = useTransform(spring, (v) => Math.round(v))
  useEffect(() => spring.set(value), [spring, value])
  return <motion.span>{rounded}</motion.span>
}

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

export default function App() {
  const [place, setPlace] = useState(() => store.get('place') || DEFAULT_PLACE)
  const [unit, setUnit] = useState(() => store.get('unit') || 'C')
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [selected, setSelected] = useState(0)
  const [locating, setLocating] = useState(false)
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => store.set('unit', unit), [unit])

  useEffect(() => {
    store.set('place', place)
    const ctl = new AbortController()
    setStatus('loading')
    fetchForecast(place, ctl.signal)
      .then((d) => {
        setData(d)
        setSelected(0)
        setStatus('ready')
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setStatus('error')
      })
    return () => ctl.abort()
  }, [place, attempt])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setNotice('This browser can’t share its location. Search for a city instead.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const names = await reverseGeocode(coords.latitude, coords.longitude)
        setPlace({ ...names, lat: coords.latitude, lon: coords.longitude })
        setLocating(false)
        setNotice('')
      },
      () => {
        setLocating(false)
        setNotice('Location access is off. Allow it in your browser, or search for a city.')
      },
      { timeout: 10000, maximumAge: 600000 }
    )
  }, [])

  // Only auto-locate on first visit when permission was already granted.
  useEffect(() => {
    if (store.get('place')) return
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => p.state === 'granted' && locate(), () => {})
  }, [locate])

  const hour = data?.hours[selected] ?? placeholderHour()
  const isNight = sunPhase(hour) === 'night'
  const desc = describe(hour.code, isNight)
  const summary = useMemo(() => data && summarize(data.hours, data.days[0], unit), [data, unit])

  return (
    <>
      <Sky hour={hour} desc={data ? desc : describe(1)} />
      <Precipitation kind={data ? desc.precip : null} intensity={desc.intensity} />

      <div className="page">
        <header className="bar">
          <Search onPick={setPlace} onLocate={locate} locating={locating} />
          <div className="units" role="group" aria-label="Temperature unit">
            {['C', 'F'].map((u) => (
              <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)}>
                {unit === u && <motion.span layoutId="unit-pill" className="unit-pill" />}
                <span>°{u}</span>
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence>
          {notice && (
            <motion.p
              className="notice"
              role="status"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {notice}
              <button type="button" onClick={() => setNotice('')}>
                Dismiss
              </button>
            </motion.p>
          )}
        </AnimatePresence>

        {status === 'error' && !data ? (
          <section className="state">
            <h1>Couldn’t load the forecast for {place.name}.</h1>
            <p>The weather service didn’t respond. Check your connection, then try again.</p>
            <button type="button" className="retry" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          </section>
        ) : !data ? (
          <section className="state" aria-live="polite">
            <motion.div
              className="loader"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <p>Reading the sky over {place.name}</p>
          </section>
        ) : (
          <>
            <motion.section
              key={place.lat + ',' + place.lon}
              className="hero"
              variants={heroVariants}
              initial="hidden"
              animate="show"
              aria-live="polite"
            >
              <motion.div variants={heroItem} className="place">
                <h1>{place.name}</h1>
                {place.region && <p>{place.region}</p>}
              </motion.div>

              <motion.div variants={heroItem} className="temp" aria-label={`${Math.round(toUnit(hour.temp, unit))} degrees`}>
                <Temperature value={toUnit(hour.temp, unit)} />
                <span className="temp-deg">°</span>
              </motion.div>

              <motion.div variants={heroItem} className="condition">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={desc.label}
                    className="condition-label"
                    initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                    transition={{ duration: 0.35 }}
                  >
                    {desc.label}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {selected > 0 && (
                    <motion.button
                      type="button"
                      className="back-now"
                      onClick={() => setSelected(0)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      at {hourLabel(hour.time)}, back to now
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.p variants={heroItem} className="summary">
                {summary}
              </motion.p>
            </motion.section>

            <section className="panel" aria-label="Forecast">
              <HourlyScrubber hours={data.hours} index={selected} onChange={setSelected} unit={unit} />
              <div className="lower">
                <Daily days={data.days} unit={unit} />
                <Details current={data.current} today={data.days[0]} unit={unit} />
              </div>
            </section>

            <footer className="credit">
              Forecast data from <a href="https://open-meteo.com/">Open-Meteo</a>
            </footer>
          </>
        )}
      </div>
    </>
  )
}
