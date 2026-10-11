# Skyline Weather

A weather app where the page itself is the forecast. The background sky is drawn live from the weather data: its gradient follows the sun through dawn, day, dusk and night; the sun or moon moves along its arc; clouds build up with cloud cover; and rain, drizzle, snow or lightning fall across the screen.

Built with React 19, Vite and [Motion](https://motion.dev). Forecast data comes from [Open-Meteo](https://open-meteo.com/), so you don't need an API key.

## Features

- **Live sky.** Sky colors, sun or moon position, cloud count and precipitation particles all come from the current conditions and the place's sunrise and sunset times.
- **Hourly scrubber.** Drag across (or use the arrow keys on) the 24-hour temperature curve. The sky and headline update to show that hour.
- **7-day forecast.** Each day shows its high and low as a range bar on a scale shared by the whole week.
- **Current details.** Feels-like temperature, humidity, wind speed and direction, UV index, sunrise and sunset.
- **City search.** Search any city by name, with debounced results and keyboard navigation (↑ ↓ Enter Esc).
- **Your location.** Use the browser's geolocation, with reverse geocoding to show your city's name.
- **°C / °F toggle.** Your chosen unit and your last place are saved in `localStorage`.
- **Accessible.** Respects `prefers-reduced-motion`, uses ARIA live regions for updates, and every control works from the keyboard.

## Getting started

Requires Node.js 20.19 or newer (needed by Vite 7).

```bash
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

| Script            | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload      |
| `npm run build`   | Build a production bundle into `dist/`    |
| `npm run preview` | Serve the production build locally        |

## Project structure

```
src/
├── App.jsx                  # App state, data loading, hero section
├── main.jsx                 # React entry point
├── styles.css
├── components/
│   ├── Sky.jsx              # Gradient sky, sun/moon, stars, clouds
│   ├── Precipitation.jsx    # Canvas particles: rain, drizzle, snow, lightning
│   ├── HourlyScrubber.jsx   # Draggable 24-hour temperature curve
│   ├── Daily.jsx            # 7-day forecast with range bars
│   ├── Details.jsx          # Current conditions grid
│   ├── Search.jsx           # City search and "use my location"
│   └── Glyph.jsx            # Line icons for weather conditions
└── lib/
    ├── api.js               # Forecast, geocoding and reverse-geocoding requests
    ├── weather.js           # WMO weather codes, labels, units, formatting
    └── sky.js               # Sun phase, celestial position, sky color palettes
```

## How the sky works

1. `lib/weather.js` maps each [WMO weather code](https://open-meteo.com/en/docs#weathervariables) to a label, a condition kind, a "grey" amount (how washed out the sky is) and, where relevant, a precipitation type and intensity.
2. `lib/sky.js` uses the selected hour and that day's sunrise and sunset to work out the phase (`dawn`, `day`, `dusk`, `night`). It then blends a clear palette toward an overcast one according to the grey amount, and darkens it further for storms.
3. `Sky.jsx` animates the gradient, the sun or moon on its arc, and the clouds. `Precipitation.jsx` draws particles on a `<canvas>` sized for the device pixel ratio.

## Data sources

| Service | Used for |
| ------- | -------- |
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | Current, hourly and daily forecast |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City search |
| [BigDataCloud reverse geocoding](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Turning your coordinates into a city name |

Neither service needs an API key. The default location is Dhaka, Bangladesh.
