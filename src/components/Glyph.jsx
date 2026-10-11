// Small line icons for condition kinds.
export default function Glyph({ kind, night = false, size = 22 }) {
  const cloud = <path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 11.5 3.25 3.25 0 0 0 7 18Z" />
  const sun = (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  )
  const moon = <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />

  const shapes = {
    clear: night ? moon : sun,
    partly: (
      <>
        {night ? (
          <path d="M15.5 9.2A4.5 4.5 0 0 1 10.3 4a4.5 4.5 0 1 0 5.2 5.2Z" />
        ) : (
          <>
            <circle cx="9" cy="8" r="3" />
            <path d="M9 2.5v1M3.5 8h1M5 4l.8.8M13 4l-.8.8" />
          </>
        )}
        <path d="M9 20h8a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 8.7 14 3 3 0 0 0 9 20Z" />
      </>
    ),
    cloudy: cloud,
    fog: <path d="M4 9h16M6 13h12M4 17h16" />,
    drizzle: (
      <>
        <path d="M7 15h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 8.5 3.25 3.25 0 0 0 7 15Z" />
        <path d="M9 18.5v.5M13 18.5v.5M11 20.5v.5" />
      </>
    ),
    rain: (
      <>
        <path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5 3.25 3.25 0 0 0 7 14Z" />
        <path d="M9 17l-1 3M13 17l-1 3M17 17l-1 3" />
      </>
    ),
    snow: (
      <>
        <path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5 3.25 3.25 0 0 0 7 14Z" />
        <circle cx="9" cy="18" r=".6" />
        <circle cx="13" cy="20" r=".6" />
        <circle cx="16" cy="17.5" r=".6" />
      </>
    ),
    storm: (
      <>
        <path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5 3.25 3.25 0 0 0 7 14Z" />
        <path d="M12.5 14l-2 4h3l-2 4" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[kind] || cloud}
    </svg>
  )
}
