import { motion } from 'motion/react'
import Glyph from './Glyph'
import { deg, describe, dayLabel } from '../lib/weather'

export default function Daily({ days, unit }) {
  const lo = Math.min(...days.map((d) => d.min))
  const hi = Math.max(...days.map((d) => d.max))
  const span = hi - lo || 1

  return (
    <section className="daily" aria-labelledby="daily-title">
      <h2 id="daily-title">Next 7 days</h2>
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {days.map((d, i) => {
          const left = ((d.min - lo) / span) * 100
          const width = Math.max(4, ((d.max - d.min) / span) * 100)
          return (
            <li key={d.date}>
              <span className="day-name">{dayLabel(d.date, i)}</span>
              <span className="day-icon" title={describe(d.code).label}>
                <Glyph kind={describe(d.code).kind} />
              </span>
              <span className="day-pop">{d.pop >= 20 ? `${d.pop}%` : ''}</span>
              <span className="day-min">{deg(d.min, unit)}</span>
              <span className="range">
                <motion.span
                  className="range-fill"
                  style={{ left: `${left}%`, width: `${width}%`, originX: 0 }}
                  variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1 } }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span
                    className="range-gradient"
                    style={{ width: `${(100 / width) * 100}%`, marginLeft: `${-(left / width) * 100}%` }}
                  />
                </motion.span>
              </span>
              <span className="day-max">{deg(d.max, unit)}</span>
            </li>
          )
        })}
      </motion.ul>
    </section>
  )
}
