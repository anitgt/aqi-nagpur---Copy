import { useState, useEffect } from 'react'
import axios from 'axios'
import AQIGauge from './components/AQIGauge'
import ForecastChart from './components/ForecastChart'
import Forecast7Chart from './components/Forecast7Chart'
import PollutantPanel from './components/PollutantPanel'
import WeatherPanel from './components/WeatherPanel'
import HealthAdvisory from './components/HealthAdvisory'
import WhyBadToday from './components/WhyBadToday'
import EventBanner from './components/EventBanner'
import LocalitySelector from './components/LocalitySelector'
import RRSCard from './components/RRSCard'
import PM25TrendChart from './components/PM25TrendChart'
import './index.css'

const API = import.meta.env.PROD ? '' : 'http://localhost:5000'

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-3)',
      letterSpacing: '0.1em',
      userSelect: 'none',
    }}>
      {t.toLocaleTimeString('en-IN', { hour12: false })}
    </span>
  )
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ border: 'none', outline: 'none' }}
    >
      <div className="theme-toggle-icons">
        <span>🌙</span>
        <span>☀️</span>
      </div>
      <div className="theme-toggle-knob" />
    </button>
  )
}

function ProfileSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--accent-dim)',
        color: 'var(--text)',
        border: '1px solid var(--card-border-h)',
        borderRadius: 10,
        padding: '7px 36px 7px 14px',
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2300d2ff' opacity='0.5' d='M5 7L0 0h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'calc(100% - 13px) center',
        transition: 'border-color 0.2s, background 0.4s',
      }}
    >
      <option value="general">👤 General</option>
      <option value="asthma">🫁 Asthmatic</option>
      <option value="runner">🏃 Runner</option>
      <option value="parent">👶 Parent</option>
    </select>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 'calc(100vh - 62px)', gap: 18,
      position: 'relative', zIndex: 1,
    }}>
      <div style={{
        width: 44, height: 44,
        border: '2px solid var(--accent-dim)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        boxShadow: '0 0 20px rgba(0,210,255,0.25)',
      }} />
      <p style={{
        fontFamily: 'var(--font-head)',
        fontSize: 11, color: 'var(--text-3)',
        letterSpacing: '0.3em',
        animation: 'blink 2s ease-in-out infinite',
      }}>
        FETCHING LIVE DATA
      </p>
    </div>
  )
}

export default function App() {
  const [station, setStation]   = useState('civil_lines')
  const [profile, setProfile]   = useState('general')
  const [current, setCurrent]   = useState(null)
  const [forecast, setForecast] = useState(null)
  const [context, setContext]   = useState(null)
  const [rrs, setRrs]           = useState(null)
  const [forecast7, setForecast7] = useState(null)
  const [loading, setLoading]   = useState(true)

  // Theme — persist to localStorage
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('aqi-theme') !== 'light' }
    catch { return true }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try { localStorage.setItem('aqi-theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  useEffect(() => { fetchAll() }, [station])

  async function fetchAll() {
    setLoading(true)
    try {
      const [cur, ctx] = await Promise.all([
        axios.get(`${API}/api/current?station=${station}`),
        axios.get(`${API}/api/context`),
      ])
      setCurrent(cur.data)
      setContext(ctx.data)
      const { pm25, pm10, no2, so2, co, humidity, wind } = cur.data
      const [pred, rrsData] = await Promise.all([
        axios.get(`${API}/api/predict?pm25=${pm25||60}&pm10=${pm10||80}&no2=${no2||40}&so2=${so2||15}&co=${co||1.5}`),
        axios.get(`${API}/api/rrs?aqi=${cur.data.aqi}&humidity=${humidity||50}&wind=${wind||10}`),
      ])
      setForecast(pred.data)
      setRrs(rrsData.data)
      const f7 = await axios.get(`${API}/api/forecast7?pm25=${pm25||60}&pm10=${pm10||80}&no2=${no2||40}&so2=${so2||15}&co=${co||1.5}&current_aqi=${cur.data.aqi}`)
      setForecast7(f7.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Background grid overlay */}
      <div className="app-bg" />

      {/* ── HEADER ─────────────────────────── */}
      <header className="app-header">
        {/* Logo */}
        <div className="header-logo">
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--teal)',
            boxShadow: '0 0 10px var(--teal)',
            animation: 'blink 2.5s ease-in-out infinite',
          }} />
          <div>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 21, fontWeight: 800,
              letterSpacing: '0.14em',
              background: 'linear-gradient(90deg, var(--accent) 0%, #80e8ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              AQI NAGPUR
            </h1>
            <p style={{
              fontFamily: 'var(--font-head)',
              fontSize: 9, fontWeight: 600,
              color: 'var(--text-3)',
              letterSpacing: '0.2em',
              marginTop: 3,
            }}>
              AIR INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          <div className="hide-mobile"><LiveClock /></div>
          <div className="divider-line" style={{ width: 1, height: 22, background: 'var(--card-border)' }} />
          <LocalitySelector value={station} onChange={setStation} />
          <ProfileSelect value={profile} onChange={setProfile} />
          <div className="divider-line" style={{ width: 1, height: 22, background: 'var(--card-border)' }} />
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(p => !p)} />
        </div>
      </header>

      {/* ── MAIN ───────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {loading
          ? <LoadingScreen />
          : (
            <main className="app-main">

              {context?.active && (
                <div style={{ marginBottom: 20 }}>
                  <EventBanner context={context} />
                </div>
              )}

              {/* Row 1 */}
              <div className="grid-row-1">
                <div className="aqi-card d1"><AQIGauge aqi={current?.aqi} stationName={current?.station_name} /></div>
                <div className="aqi-card d2"><HealthAdvisory aqi={current?.aqi} profile={profile} forecast={forecast} /></div>
              </div>

              {/* Row 2: 7-day forecast */}
              <div className="aqi-card d3" style={{ marginBottom: 18 }}>
              <Forecast7Chart data={forecast7?.forecast} currentAqi={current?.aqi} />
              </div>

              {/* PM2.5 Historical Trend */}
              <div className="aqi-card d3" style={{ marginBottom: 18 }}>
              <PM25TrendChart />
              </div>

              {/* Row 3: Pollutant + Weather */}
              <div className="grid-row-2">
                <div className="aqi-card d4"><PollutantPanel current={current} /></div>
                <div className="aqi-card d5"><WeatherPanel current={current} /></div>
              </div>

              {/* Row 4: Why + RRS */}
              <div className="grid-row-3">
                <div className="aqi-card d4"><WhyBadToday pollutant={current?.dominant_pollutant} current={current} /></div>
                <div className="aqi-card d5"><RRSCard rrs={rrs} /></div>
              </div>

            </main>
          )
        }
      </div>
    </div>
  )
}