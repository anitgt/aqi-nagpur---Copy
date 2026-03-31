import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts'

function getColor(aqi) {
  if (!aqi || aqi <= 0) return 'var(--text-3)'
  if (aqi <= 50)  return '#00e5a0'
  if (aqi <= 100) return '#e8e040'
  if (aqi <= 150) return '#ff9820'
  if (aqi <= 200) return '#ff4560'
  if (aqi <= 300) return '#b060e0'
  return '#8b0030'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  const color = getColor(value)
  return (
    <div style={{
      background: 'var(--inner-box-bg-2)',
      border: `1px solid ${color}35`,
      borderRadius: 14,
      padding: '14px 20px',
      backdropFilter: 'blur(16px)',
      boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 16px ${color}15`,
    }}>
      <p style={{
        fontFamily: 'var(--font-head)',
        fontSize: 9, fontWeight: 700,
        color: 'var(--text-2)',
        letterSpacing: '0.18em',
        marginBottom: 6,
      }}>
        {name.toUpperCase()}
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 26, fontWeight: 700,
        color,
        lineHeight: 1,
        textShadow: `0 0 16px ${color}60`,
      }}>
        {value}
        <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 5, fontWeight: 400 }}>AQI</span>
      </p>
    </div>
  )
}

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props
  if (!height || height <= 0) return null
  const safeColor = fill && fill !== 'var(--text-3)' ? fill : '#2a3f55'
  const id = `bar-grad-${safeColor.replace('#', '')}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={safeColor} stopOpacity={0.9} />
          <stop offset="100%" stopColor={safeColor} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        rx={7} ry={7}
        fill={`url(#${id})`}
        style={{ filter: `drop-shadow(0 0 8px ${safeColor}45)` }}
      />
      {/* Top glow line */}
      <rect x={x + 2} y={y} width={width - 4} height={2} rx={1} fill={safeColor} opacity={0.7} />
    </g>
  )
}

export default function ForecastChart({ current, forecast }) {
  const data = [
    { name: 'Now',           value: current || 0 },
    { name: '24hr Forecast', value: forecast?.predicted_24h || 0 },
    { name: '48hr Forecast', value: forecast?.predicted_48h || 0 },
  ]

  return (
    <div style={{ padding: '26px 28px 18px' }}>
      <div className="section-label">
        <span>48-Hour AQI Forecast</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={58} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="1 6"
            stroke="var(--card-border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Syne', fontWeight: 600 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[0, 320]}
            tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false} tickLine={false} width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-border)', radius: 8 }} />
          <ReferenceLine y={100}
            stroke="rgba(232,224,64,0.25)" strokeDasharray="5 6"
            label={{ value: 'MODERATE', fill: 'rgba(232,224,64,0.5)', fontSize: 8.5, fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.12em', dx: -4 }}
          />
          <ReferenceLine y={150}
            stroke="rgba(255,152,32,0.25)" strokeDasharray="5 6"
            label={{ value: 'UNHEALTHY', fill: 'rgba(255,152,32,0.5)', fontSize: 8.5, fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.12em', dx: -4 }}
          />
          <Bar dataKey="value" shape={<CustomBar />}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}