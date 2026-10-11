import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import Glyph from './Glyph'
import { deg, describe, hourLabel } from '../lib/weather'
import { sunPhase } from '../lib/sky'

const W = 1000
const H = 150
const PAD = 26

function smoothPath(points) {
  return points.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`
    const [x0, y0] = a[i - 2] || a[i - 1]
    const [x1, y1] = a[i - 1]
    const [x3, y3] = a[i + 1] || [x, y]
    const c1x = x1 + (x - x0) / 6
    const c1y = y1 + (y - y0) / 6
    const c2x = x - (x3 - x1) / 6
    const c2y = y - (y3 - y1) / 6
    return `${d} C${c1x},${c1y} ${c2x},${c2y} ${x},${y}`
  }, '')
}

export default function HourlyScrubber({ hours, index, onChange, unit }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const temps = hours.map((h) => h.temp)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const last = hours.length - 1
  const px = (i) => (i / last) * W
  const py = (t) => PAD + (1 - (t - min) / (max - min || 1)) * (H - PAD * 2)
  const points = hours.map((h, i) => [px(i), py(h.temp)])
  const line = smoothPath(points)
  const area = `${line} L${W},${H} L0,${H} Z`

  const pick = (clientX) => {
    const r = trackRef.current.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    const next = Math.round(p * last)
    if (next !== index) onChange(next)
  }

  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
    if (step) onChange(Math.min(last, Math.max(0, index + step)))
    else if (e.key === 'Home') onChange(0)
    else if (e.key === 'End') onChange(last)
    else return
    e.preventDefault()
  }

  const sel = hours[index]
  const thumbX = (index / last) * 100
  const thumbY = (py(sel.temp) / H) * 100

  return (
    <div className="scrubber">
      <p className="scrubber-hint">Drag across the day to see the sky change</p>
      <div
        ref={trackRef}
        className={`track${dragging ? ' is-dragging' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label="Hour of forecast"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={index}
        aria-valuetext={`${index === 0 ? 'Now' : hourLabel(sel.time)}, ${deg(sel.temp, unit)}, ${describe(sel.code).label}`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          pick(e.clientX)
        }}
        onPointerMove={(e) => dragging && pick(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="curve">
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="past">
              <motion.rect
                x="0"
                y="0"
                height={H}
                initial={{ width: 0 }}
                animate={{ width: px(index) }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
            </clipPath>
          </defs>
          <path d={area} fill="url(#area)" />
          <motion.path
            d={line}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />
          <path
            d={line}
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#past)"
          />
        </svg>

        {hours.map((h, i) =>
          h.pop >= 20 ? (
            <span
              key={h.time}
              className="pop-bar"
              style={{ left: `${(i / last) * 100}%`, height: `${h.pop * 0.28}px` }}
            />
          ) : null
        )}

        <motion.div
          className="thumb"
          initial={false}
          animate={{ left: `${thumbX}%`, top: `${thumbY}%`, scale: dragging ? 1.25 : 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <span className="thumb-label">{deg(sel.temp, unit)}</span>
        </motion.div>
      </div>

      <ol className="ticks">
        {hours.map((h, i) =>
          i % 3 === 0 ? (
            <li key={h.time} style={{ left: `${(i / last) * 100}%` }} className={i === index ? 'is-active' : ''}>
              <Glyph kind={describe(h.code).kind} night={sunPhase(h) === 'night'} size={18} />
              <span>{i === 0 ? 'Now' : hourLabel(h.time)}</span>
            </li>
          ) : null
        )}
      </ol>
    </div>
  )
}
