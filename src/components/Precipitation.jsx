import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

// Canvas particles for rain, drizzle, snow and storms (rain + lightning).
export default function Precipitation({ kind, intensity }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    if (!kind || reduce) {
      ctx.clearRect(0, 0, w, h)
      return () => window.removeEventListener('resize', resize)
    }

    const isSnow = kind === 'snow'
    const isDrizzle = kind === 'drizzle'
    const count = Math.round((isSnow ? 160 : isDrizzle ? 120 : 260) * Math.max(0.3, intensity))
    const wind = isSnow ? 0.15 : 0.22

    const spawn = (anywhere) => ({
      x: Math.random() * (w + 200) - 100,
      y: anywhere ? Math.random() * h : -20 - Math.random() * 60,
      z: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    })
    const drops = Array.from({ length: count }, () => spawn(true))

    let flash = 0
    let last = performance.now()

    const frame = (now) => {
      const dt = Math.min(48, now - last) / 16.67
      last = now
      ctx.clearRect(0, 0, w, h)

      if (kind === 'storm') {
        if (flash <= 0.01 && Math.random() < 0.003 * dt) flash = 1
        if (flash > 0.01) {
          ctx.fillStyle = `rgba(220, 230, 255, ${flash * 0.35})`
          ctx.fillRect(0, 0, w, h)
          flash *= 0.9
        }
      }

      for (const d of drops) {
        if (isSnow) {
          d.phase += 0.02 * dt
          d.y += (0.6 + d.z * 1.2) * dt
          d.x += (Math.sin(d.phase) * 0.6 + wind) * dt
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${0.35 + d.z * 0.55})`
          ctx.arc(d.x, d.y, 1 + d.z * 2.4, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const speed = (isDrizzle ? 7 : 13) * d.z
          const len = (isDrizzle ? 7 : 16) * d.z
          d.y += speed * dt
          d.x += speed * wind * dt
          ctx.beginPath()
          ctx.strokeStyle = `rgba(210,225,255,${0.18 + d.z * 0.35})`
          ctx.lineWidth = isDrizzle ? 1 : 1.2
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - len * wind, d.y - len)
          ctx.stroke()
        }
        if (d.y > h + 20 || d.x > w + 100) Object.assign(d, spawn(false))
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [kind, intensity, reduce])

  return <canvas ref={ref} className="precip" aria-hidden="true" />
}
