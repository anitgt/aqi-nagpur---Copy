import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts'

function getColor(aqi) {
  if (!aqi) return '#2a3f55'
  if (aqi <= 50)  return '#00e5a0'
  if (aqi <= 100) return '#e8e040'
  if (aqi <= 150) return '#ff9820'
  if (aqi <= 200) return '#ff4560'
  if (aqi <= 300) return '#b060e0'
  return '#8b0030'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { day, aqi } = payload[0].payload
  const color = getColor(aqi)
  return (
    <div style={{ background: 'rgba(4,12,22,0.96)', border: `1px solid ${color}35`, borderRadius: 12, padding: '12px 18px' }}>
      <p style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-2)', letterSpacing: '0.15em', marginBottom: 5 }}>{day}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color, textShadow: `0 0 12px ${color}80` }}>
        {aqi} <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>AQI</span>
      </p>
    </div>
  )
}

export default function Forecast7Chart({ data, currentAqi }) {
  if (!data) return null
  const chartData = [
    { day: 'Today', aqi: currentAqi || 0 },
    ...data.map(d => ({ day: d.day, aqi: d.aqi }))
  ]

  return (
    <div style={{ padding: '26px 28px' }}>
      <div className="section-label"><span>7-Day AQI Forecast</span></div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={44} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="1 6" stroke="rgba(0,210,255,0.05)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Syne', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 320]} tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,210,255,0.025)', radius: 6 }} />
          <ReferenceLine y={100} stroke="rgba(232,224,64,0.2)" strokeDasharray="5 6" label={{ value: 'MODERATE', fill: 'rgba(232,224,64,0.4)', fontSize: 8, fontFamily: 'Syne', fontWeight: 700 }} />
          <ReferenceLine y={150} stroke="rgba(255,152,32,0.2)" strokeDasharray="5 6" label={{ value: 'UNHEALTHY', fill: 'rgba(255,152,32,0.4)', fontSize: 8, fontFamily: 'Syne', fontWeight: 700 }} />
          <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.aqi)} fillOpacity={i === 0 ? 1 : 0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}