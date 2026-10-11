import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { searchPlaces } from '../lib/api'

export default function Search({ onPick, onLocate, locating }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setMessage('')
      return
    }
    const ctl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const found = await searchPlaces(q, ctl.signal)
        setResults(found)
        setActive(0)
        setMessage(found.length ? '' : `No places match “${q}”. Check the spelling or try a nearby city.`)
      } catch (e) {
        if (e.name !== 'AbortError') setMessage('Search is unavailable. Check your connection.')
      }
    }, 250)
    return () => {
      clearTimeout(t)
      ctl.abort()
    }
  }, [query])

  const pick = (place) => {
    onPick(place)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') setActive((a) => Math.min(results.length - 1, a + 1))
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1))
    else if (e.key === 'Enter' && results[active]) pick(results[active])
    else if (e.key === 'Escape') setOpen(false)
    else return
    e.preventDefault()
  }

  const showList = open && (results.length > 0 || message)

  return (
    <div className="search">
      <div className="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search a city"
          aria-label="Search a city"
          aria-expanded={showList}
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `place-${results[active].id}` : undefined}
          role="combobox"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        <motion.button
          type="button"
          className="locate"
          onClick={onLocate}
          whileTap={{ scale: 0.9 }}
          aria-label="Use my location"
          title="Use my location"
        >
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            animate={locating ? { rotate: 360 } : { rotate: 0 }}
            transition={locating ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : { duration: 0.3 }}
          >
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </motion.svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id="search-results"
            role="listbox"
            className="results"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {message && !results.length ? (
              <li className="results-empty">{message}</li>
            ) : (
              results.map((r, i) => (
                <li
                  key={r.id}
                  id={`place-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? 'is-active' : ''}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(r)}
                >
                  {i === active && <motion.span layoutId="result-hi" className="result-hi" />}
                  <strong>{r.name}</strong>
                  <span>{r.region}</span>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
