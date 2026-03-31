import { useState, useEffect } from 'react'

const POLLUTANT_META = {
  pm25: { label: 'PM2.5', icon: '🏭', color: '#ff4560' },
  pm10: { label: 'PM10',  icon: '🚧', color: '#ff9820' },
  no2:  { label: 'NO₂',  icon: '🚛', color: '#b060e0' },
  so2:  { label: 'SO₂',  icon: '⚡', color: '#e8e040' },
  co:   { label: 'CO',   icon: '🚗', color: '#00e5a0' },
}

const FALLBACK = {
  pm25: {
    cause: 'Fine particulate matter elevated. Likely sources include industrial emissions from Butibori MIDC, vehicular exhaust, and biomass burning across Vidarbha.',
    sources: ['Butibori MIDC', 'Vehicle exhaust', 'Biomass burning'],
    tips: ['Use N95 mask outdoors', 'Keep windows closed', 'Run air purifier indoors'],
  },
  pm10: {
    cause: 'Coarse dust particles elevated. Primary contributors are Smart City construction activity, unpaved roads, and wind-blown soil from peripheral areas.',
    sources: ['Construction sites', 'Unpaved roads', 'Wind-blown dust'],
    tips: ['Wear a dust mask', 'Avoid construction areas', 'Wash hands frequently'],
  },
  no2: {
    cause: 'Nitrogen dioxide elevated from heavy diesel combustion. Major corridors like Wardha Road and NH-44 see significant freight movement throughout the day.',
    sources: ['Wardha Road traffic', 'NH-44 freight', 'Diesel generators'],
    tips: ['Avoid busy roads at peak hours', 'Use Ring Road cycle route', 'Limit morning commute exposure'],
  },
  so2: {
    cause: 'Sulfur dioxide elevated — linked to coal combustion. Koradi and Khaperkheda thermal power plants near Nagpur are the primary regional sources.',
    sources: ['Koradi Thermal Plant', 'Khaperkheda TPS', 'Industrial coal use'],
    tips: ['Stay indoors during NW winds', 'Check real-time wind direction', 'Avoid outdoor exercise today'],
  },
  co: {
    cause: 'Carbon monoxide elevated from traffic congestion. Civil Lines and Sitabuldi market areas see peak CO levels during morning and evening rush hours.',
    sources: ['Civil Lines traffic', 'Sitabuldi congestion', 'Old vehicle exhausts'],
    tips: ['Avoid peak hour commutes', 'Keep car windows up', 'Alternate route via Empress Mall'],
  },
}

function normalizeKey(p) {
  if (!p) return null
  const s = p.toLowerCase().replace(/[.\-_]/g, '')
  if (s === 'pm25' || s === 'pm2' || s === 'pm') return 'pm25'
  if (s === 'pm10') return 'pm10'
  if (s === 'no2')  return 'no2'
  if (s === 'so2')  return 'so2'
  if (s === 'co')   return 'co'
  return s
}

export default function WhyBadToday({ pollutant, current }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const key  = normalizeKey(pollutant)
  const meta = POLLUTANT_META[key] || { label: pollutant || 'Unknown', icon: '💨', color: 'var(--accent)' }

  useEffect(() => {
    if (!pollutant) return
    setLoading(true)
    const API = import.meta.env.PROD ? '' : 'http://localhost:5000'
    fetch(`${API}/api/why?pollutant=${encodeURIComponent(pollutant)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d  => { setData(d);                      setLoading(false) })
      .catch(() => { setData(FALLBACK[key] || null); setLoading(false) })
  }, [pollutant])

  if (!pollutant) return (
    <div style={{ padding: '26px 28px' }}>
      <div className="section-label"><span>Why Bad Today?</span></div>
      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Select a locality to load pollutant analysis.</p>
    </div>
  )

  return (
    <div style={{ padding: '26px 28px', position: 'relative' }}>
      {/* Corner tint */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 130, height: 90,
        background: `radial-gradient(ellipse at 0% 0%, ${meta.color}10 0%, transparent 70%)`,
        borderRadius: '20px 0 0 0', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>
          <span>Why Bad Today?</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: `${meta.color}15`,
          border: `1px solid ${meta.color}35`,
          borderRadius: 20, padding: '5px 13px',
        }}>
          <span style={{ fontSize: 13 }}>{meta.icon}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: meta.color }}>
            {meta.label}
          </span>
          {current?.[key] != null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: `${meta.color}90` }}>
              · {Math.round(current[key])} µg/m³
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: 'var(--text-2)' }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '2px solid var(--card-border)',
            borderTop: '2px solid var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, letterSpacing: '0.15em' }}>LOADING…</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Cause box — uses CSS vars, not hardcoded dark */}
          <div style={{
            background: 'var(--inner-box-bg)',
            border: `1px solid ${meta.color}20`,
            borderLeft: `2px solid ${meta.color}70`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{
              fontFamily: 'var(--font-head)', fontSize: 8.5, fontWeight: 700,
              color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 8,
            }}>
              ROOT CAUSE · NAGPUR CONTEXT
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.72, color: 'var(--prose-color)', fontFamily: 'var(--font-body)' }}>
              {data.cause}
            </p>
          </div>

          {/* Sources */}
          {data.sources?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontFamily: 'var(--font-head)', fontSize: 8.5, fontWeight: 700,
                color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 8,
              }}>
                LIKELY SOURCES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {data.sources.map(s => (
                  <span key={s} style={{
                    background: `${meta.color}12`,
                    border: `1px solid ${meta.color}30`,
                    borderRadius: 6, padding: '4px 11px',
                    fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500,
                    color: meta.color,
                  }}>
                    📍 {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {data.tips?.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0 14px' }} />
              <p style={{
                fontFamily: 'var(--font-head)', fontSize: 8.5, fontWeight: 700,
                color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 10,
              }}>
                PROTECTIVE STEPS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: `${meta.color}15`,
                      border: `1px solid ${meta.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 9, color: meta.color, fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}