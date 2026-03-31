import { useEffect, useRef } from 'react'

const LEVEL_CONFIG = {
  Low: {
    color: '#00e5a0', arcColor: '#00e5a0',
    label: 'LOW RISK', advice: 'Air is relatively safe. Normal outdoor activity is fine for most people.',
  },
  Moderate: {
    color: '#f0b429', arcColor: '#f0b429',
    label: 'MODERATE RISK', advice: 'Sensitive groups (asthma, elderly, children) should reduce prolonged outdoor exposure.',
  },
  High: {
    color: '#ff9820', arcColor: '#ff9820',
    label: 'HIGH RISK', advice: 'Wear an N95 mask outdoors. Avoid vigorous activity. Keep windows closed.',
  },
  Severe: {
    color: '#ff4560', arcColor: '#ff4560',
    label: 'SEVERE RISK', advice: 'Stay indoors. Respiratory patients must not go outside. Use air purifier.',
  },
}

function drawArc(canvas, score, color) {
  if (!canvas) return
  const dpr  = window.devicePixelRatio || 1
  const size = 130
  canvas.width  = size * dpr
  canvas.height = size * dpr
  canvas.style.width  = size + 'px'
  canvas.style.height = size + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const cx = size / 2, cy = size / 2
  const r  = 52
  const startAngle = Math.PI * 0.75
  const endAngle   = Math.PI * 2.25
  const lw = 10

  // Track
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.strokeStyle = 'rgba(128,128,128,0.15)'
  ctx.lineWidth   = lw
  ctx.lineCap     = 'round'
  ctx.stroke()

  // Fill
  const frac    = Math.min(Math.max(score / 100, 0), 1)
  const fillEnd = startAngle + frac * (endAngle - startAngle)
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, fillEnd)
  ctx.strokeStyle  = color
  ctx.lineWidth    = lw
  ctx.lineCap      = 'round'
  ctx.shadowColor  = color
  ctx.shadowBlur   = 14
  ctx.stroke()

  // Outer glow ring
  ctx.shadowBlur  = 0
  ctx.beginPath()
  ctx.arc(cx, cy, r + 9, startAngle, fillEnd)
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.12
  ctx.lineWidth   = 4
  ctx.lineCap     = 'round'
  ctx.stroke()
  ctx.globalAlpha = 1
}

function MiniBar({ label, value, max = 100, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: 'var(--text-3)', width: 42, textAlign: 'right', flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 5, borderRadius: 3,
        background: 'var(--inner-box-bg)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}55, ${color})`,
          boxShadow: `0 0 6px ${color}50`,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        color, width: 34, textAlign: 'left',
      }}>
        {Math.round(value)}
      </span>
    </div>
  )
}

export default function RRSCard({ rrs }) {
  const canvasRef = useRef(null)

  const score = rrs?.rrs   ?? null
  const level = rrs?.level ?? null
  const cfg   = LEVEL_CONFIG[level] || LEVEL_CONFIG['Moderate']

  useEffect(() => {
    if (score !== null) {
      const t = setTimeout(() => drawArc(canvasRef.current, score, cfg.arcColor), 60)
      return () => clearTimeout(t)
    }
  }, [score, cfg.arcColor])

  if (!rrs || score === null) return (
    <div style={{ padding: '26px 28px' }}>
      <div className="section-label"><span>Respiratory Risk Score</span></div>
      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Waiting for locality data…</p>
    </div>
  )

  return (
    <div style={{ padding: '26px 28px', position: 'relative' }}>
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 140, height: 100,
        background: `radial-gradient(ellipse at 100% 0%, ${cfg.color}10 0%, transparent 70%)`,
        borderRadius: '0 20px 0 0', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div className="section-label">
        <span>Respiratory Risk Score</span>
        <div style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 7,
          background: `${cfg.color}12`,
          border: `1px solid ${cfg.color}30`,
          borderRadius: 20, padding: '4px 12px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`,
            animation: 'blink 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-head)', fontSize: 9, fontWeight: 700,
            color: cfg.color, letterSpacing: '0.14em',
          }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

        {/* Canvas gauge */}
        <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
          <canvas ref={canvasRef} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 36,
              color: cfg.color, lineHeight: 1,
              textShadow: `0 0 20px ${cfg.color}80`,
            }}>
              {score}
            </span>
            <span style={{
              fontFamily: 'var(--font-head)', fontSize: 9,
              color: 'var(--text-3)', letterSpacing: '0.12em', marginTop: 4,
            }}>
              / 100
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{
            fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
            color: cfg.color, marginBottom: 10, lineHeight: 1.3,
          }}>
            {cfg.label.charAt(0) + cfg.label.slice(1).toLowerCase().replace('risk', 'Risk')}
          </p>
          <p style={{
            fontSize: 13, lineHeight: 1.65,
            color: 'var(--text-2)', fontFamily: 'var(--font-body)',
          }}>
            {cfg.advice}
          </p>
        </div>
      </div>

      {/* Pollutant bars */}
      {rrs.pm25 !== undefined && (
        <>
          <div style={{ height: 1, background: 'var(--divider)', margin: '18px 0 14px' }} />
          <p style={{
            fontFamily: 'var(--font-head)', fontSize: 8.5, fontWeight: 700,
            color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 10,
          }}>
            POLLUTANT CONTRIBUTORS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rrs.pm25 !== undefined && <MiniBar label="PM2.5" value={rrs.pm25} max={250} color="#ff4560" />}
            {rrs.pm10 !== undefined && <MiniBar label="PM10"  value={rrs.pm10} max={350} color="#ff9820" />}
            {rrs.no2  !== undefined && <MiniBar label="NO₂"   value={rrs.no2}  max={200} color="#b060e0" />}
          </div>
        </>
      )}
    </div>
  )
}