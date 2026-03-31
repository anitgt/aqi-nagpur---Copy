export default function EventBanner({ context }) {
  if (!context?.active) return null

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(100deg, var(--event-bg-start) 0%, var(--event-bg-end) 100%)',
      border: '1px solid rgba(240,180,41,0.22)',
      borderLeft: '3px solid var(--gold)',
      borderRadius: 16,
      padding: '16px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      backdropFilter: 'blur(12px)',
      overflow: 'hidden',
    }}>
      {/* Glow behind */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 160,
        background: 'radial-gradient(ellipse at 0% 50%, rgba(240,180,41,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'rgba(240,180,41,0.12)',
        border: '1px solid rgba(240,180,41,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        ⚠️
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-head)',
          fontSize: 11, fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.16em',
          marginBottom: 4,
        }}>
          {(context.event || 'SEASONAL ALERT').toUpperCase()}
        </p>
        <p style={{
          fontSize: 13,
          color: 'var(--text-2)',
          lineHeight: 1.55,
          fontFamily: 'var(--font-body)',
        }}>
          {context.warning || 'Elevated pollution levels expected. Take precautions.'}
        </p>
      </div>

      {/* Right badge */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(240,180,41,0.10)',
        border: '1px solid rgba(240,180,41,0.22)',
        borderRadius: 8, padding: '6px 12px',
        fontFamily: 'var(--font-head)',
        fontSize: 9, fontWeight: 700,
        color: 'var(--gold)',
        letterSpacing: '0.14em',
        whiteSpace: 'nowrap',
      }}>
        ACTIVE ALERT
      </div>
    </div>
  )
}