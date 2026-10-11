import { useMemo } from 'react'
import { motion } from 'motion/react'
import { celestial, cloudTint, skyColors, sunPhase } from '../lib/sky'

const CLOUD_SLOTS = 8
const drift = { type: 'spring', stiffness: 40, damping: 16 }

export default function Sky({ hour, desc }) {
  const phase = sunPhase(hour)
  const isStorm = desc.kind === 'storm'
  const [top, mid, bottom] = skyColors(phase, desc.grey, isStorm)
  const { body, x, y } = celestial(hour)
  const visibleClouds = Math.round((hour.cloud / 100) * CLOUD_SLOTS)
  const tint = cloudTint(phase, isStorm)

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: Math.random() < 0.15 ? 2.5 : 1.5,
        delay: Math.random() * 6,
      })),
    []
  )

  const clouds = useMemo(
    () =>
      Array.from({ length: CLOUD_SLOTS }, (_, i) => ({
        id: i,
        top: 4 + Math.random() * 44,
        scale: 0.6 + Math.random() * 0.9,
        duration: 90 + Math.random() * 110,
        delay: -Math.random() * 200,
      })),
    []
  )

  return (
    <div className="sky" aria-hidden="true">
      <motion.div
        className="sky-fill"
        initial={false}
        animate={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 58%, ${bottom} 100%)` }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      <motion.div
        className="stars"
        initial={false}
        animate={{ opacity: phase === 'night' ? 1 - desc.grey : phase === 'day' ? 0 : 0.25 }}
        transition={{ duration: 1.4 }}
      >
        {stars.map((s) => (
          <span
            key={s.id}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
      </motion.div>

      <motion.div
        className="sun"
        initial={false}
        animate={{
          left: `${x}%`,
          top: `${y}%`,
          opacity: body === 'sun' ? 1 - desc.grey * 0.85 : 0,
          scale: phase === 'day' ? 1 : 1.25,
        }}
        transition={drift}
      />
      <motion.div
        className="moon"
        initial={false}
        animate={{ left: `${x}%`, top: `${y}%`, opacity: body === 'moon' ? 1 - desc.grey * 0.8 : 0 }}
        transition={drift}
      />

      {clouds.map((c, i) => (
        <div
          key={c.id}
          className="cloud"
          style={{ top: `${c.top}%`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          <motion.svg
            viewBox="0 0 200 90"
            width={220 * c.scale}
            initial={false}
            animate={{ opacity: i < visibleClouds ? (phase === 'night' ? 0.8 : 0.6) : 0, color: tint }}
            transition={{ duration: 1.2 }}
          >
            <ellipse cx="60" cy="60" rx="50" ry="26" fill="currentColor" />
            <ellipse cx="100" cy="42" rx="46" ry="36" fill="currentColor" />
            <ellipse cx="145" cy="58" rx="46" ry="28" fill="currentColor" />
            <rect x="30" y="56" width="150" height="30" rx="15" fill="currentColor" />
          </motion.svg>
        </div>
      ))}

      <motion.div
        className="fog"
        initial={false}
        animate={{ opacity: desc.kind === 'fog' ? 1 : 0 }}
        transition={{ duration: 1.2 }}
      >
        <span />
        <span />
        <span />
      </motion.div>

      <div className="scrim" />
    </div>
  )
}
