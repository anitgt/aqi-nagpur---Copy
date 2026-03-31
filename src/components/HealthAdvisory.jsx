function getAdvice(profile, aqi) {
  if (!aqi) return { msg: 'Fetching data...', safe: '—' }
  if (profile === 'asthma') {
    if (aqi > 150) return { msg: 'Stay indoors. Keep inhaler accessible. Avoid all outdoor activity.', safe: 'No outdoor time' }
    if (aqi > 100) return { msg: 'Limit outdoor time. Wear N95 if going out. Avoid exercise outside.', safe: 'Max 15 mins outside' }
    return { msg: 'Moderate risk. Avoid peak traffic hours (9–11am, 6–8pm).', safe: 'Short walks okay' }
  }
  if (profile === 'runner') {
    if (aqi > 150) return { msg: 'Skip outdoor run today. Use indoor alternatives.', safe: 'No outdoor run' }
    if (aqi > 100) return { msg: 'Run early morning only (before 7am). Avoid Wardha Road route.', safe: 'Before 7am only' }
    if (aqi > 50)  return { msg: 'Safe to run early morning. Avoid high-traffic routes.', safe: 'Best: 5:30–7:30am' }
    return { msg: 'Great conditions for outdoor activity!', safe: 'All day safe' }
  }
  if (profile === 'parent') {
    if (aqi > 150) return { msg: 'Keep children indoors. Avoid school commute on foot.', safe: 'No outdoor play' }
    if (aqi > 100) return { msg: 'Avoid school commute on foot. Use vehicle with AC recirculation.', safe: 'Limit outdoor play' }
    return { msg: 'Children can play outside. Avoid peak traffic hours.', safe: 'Outdoor play okay' }
  }
  if (aqi > 200) return { msg: 'Very unhealthy. Avoid all outdoor exertion.', safe: 'Stay indoors' }
  if (aqi > 150) return { msg: 'Sensitive groups should stay indoors. Others limit exposure.', safe: 'Limit outdoor time' }
  if (aqi > 100) return { msg: 'Acceptable for most. Sensitive groups should be cautious.', safe: 'Short outings okay' }
  return { msg: 'Air quality is acceptable. Enjoy outdoor activities!', safe: 'All clear' }
}

function getRiskLabel(aqi) {
  if (!aqi) return { label: 'UNKNOWN', color: 'var(--text-3)' }
  if (aqi > 200) return { label: 'SEVERE RISK',   color: '#b060e0' }
  if (aqi > 150) return { label: 'HIGH RISK',     color: '#ff4560' }
  if (aqi > 100) return { label: 'MODERATE RISK', color: '#ff9820' }
  if (aqi > 50)  return { label: 'LOW RISK',      color: '#e8e040' }
  return            { label: 'SAFE',          color: '#00e5a0' }
}

function StatBox({ label, value, unit, color }) {
  return (
    <div className="stat-box">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>
        {value}
        {unit && <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function HealthAdvisory({ aqi, profile, forecast }) {
  const { msg, safe }    = getAdvice(profile, aqi)
  const { label, color } = getRiskLabel(aqi)

  return (
    <div style={{ padding: '26px 28px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>
          <span>Health Advisory</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: `${color}12`,
          border: `1px solid ${color}35`,
          borderRadius: 20,
          padding: '5px 12px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: 'blink 2.2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-head)',
            fontSize: 9, fontWeight: 700,
            color: color,
            letterSpacing: '0.14em',
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* Advisory message — uses CSS var so it flips with theme */}
      <div style={{
        background: `var(--advisory-bg)`,
        border: `1px solid ${color}25`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 16,
        boxShadow: `0 0 20px ${color}08`,
      }}>
        <p style={{
          fontSize: 14, lineHeight: 1.75,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
        }}>
          {msg}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatBox label="SAFE WINDOW"    value={safe}                       color={color} />
        {forecast && <>
          <StatBox label="24HR FORECAST" value={forecast.predicted_24h} unit="AQI" color="var(--accent)" />
          <StatBox label="48HR FORECAST" value={forecast.predicted_48h} unit="AQI" color="var(--accent)" />
        </>}
      </div>
    </div>
  )
}