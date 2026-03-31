const WHO = { pm25: 15, pm10: 45, no2: 25, so2: 40, co: 4 }
const META = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', color: '#ff4560', max: 250 },
  pm10: { label: 'PM10',  unit: 'µg/m³', color: '#ff9820', max: 350 },
  no2:  { label: 'NO₂',  unit: 'µg/m³', color: '#b060e0', max: 200 },
  so2:  { label: 'SO₂',  unit: 'µg/m³', color: '#e8e040', max: 150 },
  co:   { label: 'CO',   unit: 'mg/m³', color: '#00e5a0', max: 10  },
}

function Bar({ k, value }) {
  const m   = META[k]
  const who = WHO[k]
  const pct = Math.min((value / m.max) * 100, 100)
  const whoP = Math.min((who / m.max) * 100, 100)
  const over = value > who

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: m.color }}>{m.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {over && <span style={{ fontFamily: 'var(--font-head)', fontSize: 8, fontWeight: 700, color: '#ff4560', letterSpacing: '0.12em', background: 'rgba(255,69,96,0.12)', border: '1px solid rgba(255,69,96,0.3)', borderRadius: 4, padding: '2px 7px' }}>EXCEEDS WHO</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: over ? '#ff4560' : 'var(--text-2)' }}>{value ?? '--'} <span style={{ fontSize: 10, opacity: 0.5 }}>{m.unit}</span></span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'visible' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${m.color}55, ${m.color})`, borderRadius: 4, boxShadow: `0 0 8px ${m.color}50`, transition: 'width 0.8s ease' }} />
        <div style={{ position: 'absolute', left: `${whoP}%`, top: -3, bottom: -3, width: 2, background: '#ffffff30', borderRadius: 1 }}>
          <span style={{ position: 'absolute', top: -16, left: -8, fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-head)', fontWeight: 700, whiteSpace: 'nowrap' }}>WHO</span>
        </div>
      </div>
    </div>
  )
}

export default function PollutantPanel({ current }) {
  if (!current) return null
  return (
    <div style={{ padding: '26px 28px' }}>
      <div className="section-label"><span>Pollutant Breakdown</span></div>
      {['pm25','pm10','no2','so2','co'].map(k => (
        <Bar key={k} k={k} value={current[k]} />
      ))}
    </div>
  )
}