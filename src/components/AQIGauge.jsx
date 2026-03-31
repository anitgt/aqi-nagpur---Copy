import { useEffect, useRef } from 'react'

function getColor(aqi) {
  if (!aqi) return '#2a3f55'
  if (aqi <= 50)  return '#00e5a0'
  if (aqi <= 100) return '#e8e040'
  if (aqi <= 150) return '#ff9820'
  if (aqi <= 200) return '#ff4560'
  if (aqi <= 300) return '#b060e0'
  return '#8b0030'
}

function getCategory(aqi) {
  if (!aqi) return 'NO DATA'
  if (aqi <= 50)  return 'GOOD'
  if (aqi <= 100) return 'MODERATE'
  if (aqi <= 150) return 'UNHEALTHY FOR SENSITIVE'
  if (aqi <= 200) return 'UNHEALTHY'
  if (aqi <= 300) return 'VERY UNHEALTHY'
  return 'HAZARDOUS'
}

const SCALE = [
  { label: 'GOOD',    color: '#00e5a0' },
  { label: 'MOD',     color: '#e8e040' },
  { label: 'USG',     color: '#ff9820' },
  { label: 'UNHLTHY', color: '#ff4560' },
  { label: 'HAZARD',  color: '#b060e0' },
]

const RAINBOW = [
  { stop: 0.00, color: '#00e5a0' },
  { stop: 0.25, color: '#e8e040' },
  { stop: 0.55, color: '#ff9820' },
  { stop: 0.78, color: '#ff4560' },
  { stop: 1.00, color: '#b060e0' },
]

function draw(canvas, aqi) {
  if (!canvas) return
  const dpr  = window.devicePixelRatio || 1
  const W = 320, H = 185
  canvas.width  = W * dpr
  canvas.height = H * dpr
  canvas.style.width  = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const cx = W / 2
  const cy = H - 38
  const R  = 110   // radius
  const lw = 14    // track width
  const START = Math.PI          // left  (180°)
  const END   = Math.PI * 2     // right (360°)
  const pct   = Math.min((aqi || 0) / 500, 1)
  const fillEnd = START + pct * (END - START)
  const color = getColor(aqi)

  // ── Tick marks ──────────────────────────────
  const tickCount = 21
  for (let i = 0; i < tickCount; i++) {
    const a     = START + (i / (tickCount - 1)) * (END - START)
    const major = i % 5 === 0
    const r1    = R + lw + 4
    const r2    = R + lw + (major ? 16 : 9)
    ctx.beginPath()
    ctx.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a))
    ctx.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a))
    ctx.strokeStyle = major ? 'rgba(0,210,255,0.3)' : 'rgba(0,210,255,0.1)'
    ctx.lineWidth   = major ? 1.5 : 0.8
    ctx.lineCap     = 'round'
    ctx.stroke()
  }

  // ── Rainbow track ────────────────────────────
  const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy)
  RAINBOW.forEach(({ stop, color: c }) => grad.addColorStop(stop, c + '50'))
  ctx.beginPath()
  ctx.arc(cx, cy, R, START, END)
  ctx.strokeStyle = grad
  ctx.lineWidth   = lw + 4
  ctx.lineCap     = 'butt'
  ctx.stroke()

  // ── Dark overlay (dim the unlit track) ───────
  ctx.beginPath()
  ctx.arc(cx, cy, R, START, END)
  ctx.strokeStyle = 'rgba(6,15,26,0.82)'
  ctx.lineWidth   = lw + 4
  ctx.lineCap     = 'butt'
  ctx.stroke()

  // ── Fill arc — clipped to track annulus so glow can't bleed at endpoints ──
  if (pct > 0) {
    // Build annular clip path (the donut-shaped track region)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R + lw / 2 + 3, START, END)         // outer edge
    ctx.arc(cx, cy, R - lw / 2 - 3, END, START, true)   // inner edge (reverse)
    ctx.closePath()
    ctx.clip()

    // Outer glow pass
    ctx.beginPath()
    ctx.arc(cx, cy, R, START, fillEnd)
    ctx.strokeStyle = color
    ctx.lineWidth   = lw + 10
    ctx.lineCap     = 'butt'
    ctx.globalAlpha = 0.2
    ctx.shadowColor = color
    ctx.shadowBlur  = 20
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.shadowBlur  = 0

    // Main fill arc
    ctx.beginPath()
    ctx.arc(cx, cy, R, START, fillEnd)
    ctx.strokeStyle = color
    ctx.lineWidth   = lw
    ctx.lineCap     = 'butt'
    ctx.shadowColor = color
    ctx.shadowBlur  = 8
    ctx.stroke()
    ctx.shadowBlur  = 0

    ctx.restore() // end clip

    // Tip dot — drawn outside clip so it's fully visible
    const tipX = cx + R * Math.cos(fillEnd)
    const tipY = cy + R * Math.sin(fillEnd)
    ctx.beginPath()
    ctx.arc(tipX, tipY, lw / 2 + 1, 0, Math.PI * 2)
    ctx.fillStyle   = color
    ctx.shadowColor = color
    ctx.shadowBlur  = 14
    ctx.fill()
    ctx.shadowBlur  = 0
  }
}

export default function AQIGauge({ aqi, stationName }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => draw(canvasRef.current, aqi), 30)
    return () => clearTimeout(t)
  }, [aqi])

  const color = getColor(aqi)

  return (
    <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Station name */}
      <p style={{
        fontFamily: 'var(--font-head)',
        fontSize: 9, fontWeight: 700,
        color: 'var(--text-3)',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        marginBottom: 0,
      }}>
        {stationName || 'Nagpur, MH'}
      </p>

      {/* Canvas gauge */}
      <div style={{ position: 'relative', width: 320, height: 185 }}>
        <canvas ref={canvasRef} />

        {/* AQI number overlay */}
        <div style={{
          position: 'absolute',
          bottom: 50, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 58, fontWeight: 700,
            color,
            lineHeight: 1,
            textShadow: `0 0 28px ${color}90, 0 0 60px ${color}40`,
            transition: 'color 0.5s, text-shadow 0.5s',
          }}>
            {aqi ?? '--'}
          </span>
          <span style={{
            fontFamily: 'var(--font-head)',
            fontSize: 9, fontWeight: 700,
            color: 'var(--text-2)',
            letterSpacing: '0.2em',
            marginTop: 4,
          }}>
            {getCategory(aqi)}
          </span>
        </div>

        {/* 0 / 500 labels */}
        <span style={{
          position: 'absolute', bottom: 30, left: 18,
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)',
        }}>0</span>
        <span style={{
          position: 'absolute', bottom: 30, right: 18,
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)',
        }}>500</span>
      </div>

      {/* Scale legend */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 2 }}>
        {SCALE.map(({ label, color: c }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 22, height: 2, background: c, borderRadius: 1, boxShadow: `0 0 6px ${c}80` }} />
            <span style={{ fontSize: 7.5, color: 'var(--text-3)', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '0.04em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}