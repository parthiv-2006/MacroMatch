const StatCard = ({ label, value, unit, sub, color = 'var(--text)', accent }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 10,
    position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)',
  }}>
    {accent && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: 'var(--radius) var(--radius) 0 0',
      }} />
    )}
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.04em' }}>
        {value}
      </span>
      {unit && <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{sub}</div>}
  </div>
)

export default StatCard
