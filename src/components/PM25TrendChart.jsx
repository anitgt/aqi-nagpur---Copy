import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts'

const DATA = [
  { year: '1998', pm25: 27.5 }, { year: '1999', pm25: 30.0 },
  { year: '2000', pm25: 32.2 }, { year: '2001', pm25: 35.4 },
  { year: '2002', pm25: 35.4 }, { year: '2003', pm25: 37.5 },
  { year: '2004', pm25: 38.9 }, { year: '2005', pm25: 37.6 },
  { year: '2006', pm25: 40.1 }, { year: '2007', pm25: 41.5 },
  { year: '2008', pm25: 45.1 }, { year: '2009', pm25: 43.5 },
  { year: '2010', pm25: 42.2 }, { year: '2011', pm25: 46.0 },
  { year: '2012', pm25: 43.4 }, { year: '2013', pm25: 47.3 },
  { year: '2014', pm25: 47.8 }, { year: '2015', pm25: 48.8 },
  { year: '2016', pm25: 47.9 }, { year: '2017', pm25: 50.7 },
  { year: '2018', pm25: 50.0 }, { year: '2019', pm25: 49.2 },
  { year: '2020', pm25: 50.8 }, { year: '2021', pm25: 53.2 },
  { year: '2022', pm25: 46.5 },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { year, pm25 } = payload[0].payload
  return (
    <div style={{ background: 'rgba(4,12,22,0.96)', border: '1px solid rgba(255,69,96,0.3)', borderRadius: 12, padding: '12px 18px' }}>
      <p style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-2)', letterSpacing: '0.15em', marginBottom: 5 }}>{year}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#ff4560' }}>
        {pm25} <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>µg/m³</span>
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
        {pm25 > 15 ? `${((pm25/15 - 1)*100).toFixed(0)}% above WHO limit` : 'Within WHO limit'}
      </p>
    </div>
  )
}

export default function PM25TrendChart() {
  return (
    <div style={{ padding: '26px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="section-label" style={{ margin: 0 }}>
          <span>Nagpur PM2.5 Trend (1998–2022)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.14em' }}>SOURCE</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-2)' }}>UrbanEmissions.info · WUSTL Reanalysis</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pm25grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ff4560" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff4560" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 6" stroke="rgba(0,210,255,0.05)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} interval={4} />
          <YAxis domain={[0, 70]} tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={15} stroke="rgba(0,229,160,0.4)" strokeDasharray="5 5"
            label={{ value: 'WHO LIMIT (15)', fill: 'rgba(0,229,160,0.5)', fontSize: 8, fontFamily: 'Syne', fontWeight: 700 }} />
          <Area type="monotone" dataKey="pm25" stroke="#ff4560" strokeWidth={2} fill="url(#pm25grad)" dot={false} activeDot={{ r: 5, fill: '#ff4560' }} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        {[
          { label: '1998 BASELINE', value: '27.5 µg/m³', color: '#00e5a0' },
          { label: '2022 LATEST',   value: '46.5 µg/m³', color: '#ff4560' },
          { label: 'WHO SAFE LIMIT',value: '15 µg/m³',   color: '#8899aa' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-head)', fontSize: 8.5, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.16em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}