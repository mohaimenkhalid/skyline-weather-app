const ms = (iso) => new Date(iso).getTime()
const TWILIGHT = 45 * 60 * 1000

export function sunPhase(hour) {
  const t = ms(hour.time)
  const sr = ms(hour.sun.sunrise)
  const ss = ms(hour.sun.sunset)
  if (Math.abs(t - sr) < TWILIGHT) return 'dawn'
  if (Math.abs(t - ss) < TWILIGHT) return 'dusk'
  return t > sr && t < ss ? 'day' : 'night'
}

// Where the sun (or moon) sits on its arc, in % of the viewport.
export function celestial(hour) {
  const t = ms(hour.time)
  const sr = ms(hour.sun.sunrise)
  const ss = ms(hour.sun.sunset)
  const dayLen = ss - sr
  const nightLen = 86400000 - dayLen

  let body, p
  if (t >= sr && t <= ss) {
    body = 'sun'
    p = (t - sr) / dayLen
  } else {
    body = 'moon'
    p = t > ss ? (t - ss) / nightLen : (t - (sr - nightLen)) / nightLen
  }
  p = Math.min(1, Math.max(0, p))
  return { body, x: 6 + 88 * p, y: 62 - 50 * Math.sin(Math.PI * p) }
}

const CLEAR = {
  night: ['#070b24', '#161d4a', '#2e3468'],
  dawn: ['#28356f', '#a96b98', '#f3ad7d'],
  day: ['#1a63b8', '#3f8fd8', '#9fcdf2'],
  dusk: ['#221e57', '#833b73', '#ea8559'],
}
const GREY = {
  night: ['#0f1219', '#1c2029', '#2c313c'],
  dawn: ['#3f4052', '#6c6572', '#9b8c89'],
  day: ['#4d5b6b', '#71818f', '#a3afb8'],
  dusk: ['#383649', '#655a67', '#94807a'],
}
const STORM = ['#12141c', '#232633', '#3a3e4c']

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p, s) => (p >> s) & 255
  const c = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function skyColors(phase, grey, isStorm) {
  const base = CLEAR[phase].map((c, i) => mix(c, GREY[phase][i], grey))
  return isStorm ? base.map((c, i) => mix(c, STORM[i], 0.6)) : base
}

export function cloudTint(phase, isStorm) {
  if (isStorm) return '#4a4f5e'
  return { night: '#39406a', dawn: '#f2c3bd', day: '#ffffff', dusk: '#e8a8a0' }[phase]
}
