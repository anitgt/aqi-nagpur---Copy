export default function LocalitySelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'rgba(0,210,255,0.05)',
        color: 'var(--text)',
        border: '1px solid rgba(0,210,255,0.14)',
        borderRadius: 10,
        padding: '7px 36px 7px 14px',
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2300d2ff' opacity='0.45' d='M5 7L0 0h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'calc(100% - 13px) center',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(0,210,255,0.4)'
        e.target.style.boxShadow   = '0 0 0 3px rgba(0,210,255,0.08)'
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(0,210,255,0.14)'
        e.target.style.boxShadow   = 'none'
      }}
    >
      <option value="civil_lines">📍 Civil Lines</option>
      <option value="hingna">🏭 Hingna MIDC</option>
      <option value="kamptee">🛣️ Kamptee Road</option>
    </select>
  )
}