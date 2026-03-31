function Stat({ icon, label, value, unit, color }) {
  return (
    <div style={{ flex: 1, background: 'rgba(0,210,255,0.03)', border: '1px solid rgba(0,210,255,0.07)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: color || 'var(--accent)', marginBottom: 4 }}>
        {value ?? '--'}<span style={{ fontSize: 11, opacity: 0.5, marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.16em' }}>{label}</div>
    </div>
  )
}

export default function WeatherPanel({ current }) {
  if (!current) return null
  return (
    <div style={{ padding: '26px 28px' }}>
      <div className="section-label"><span>Weather Conditions</span></div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Stat icon="🌡️" label="TEMPERATURE" value={current.temperature ? Math.round(current.temperature) : null} unit="°C" color="#ff9820" />
        <Stat icon="💧" label="HUMIDITY"    value={current.humidity    ? Math.round(current.humidity)    : null} unit="%" color="#3b9ede" />
        <Stat icon="💨" label="WIND SPEED"  value={current.wind        ? current.wind.toFixed(1)          : null} unit="m/s" color="#00e5a0" />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 14, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
        {current.humidity > 70
          ? '⚠ High humidity worsens PM2.5 absorption — respiratory risk elevated.'
          : current.wind < 1
          ? '⚠ Low wind speed — pollutants not dispersing, AQI may worsen.'
          : '✓ Wind conditions are helping disperse pollutants today.'}
      </p>
    </div>
  )
}