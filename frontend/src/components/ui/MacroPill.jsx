const MACRO_CONFIG = {
  protein: { label: 'P', bg: 'var(--protein-bg)', color: 'var(--protein)' },
  carbs:   { label: 'C', bg: 'var(--carbs-bg)',   color: 'var(--carbs)'   },
  fat:     { label: 'F', bg: 'var(--fat-bg)',      color: 'var(--fat)'    },
}

const MacroPill = ({ type, value, unit = 'g', compact = false }) => {
  const c = MACRO_CONFIG[type] || MACRO_CONFIG.protein
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: c.bg, color: c.color,
      padding: compact ? '2px 6px' : '3px 8px',
      borderRadius: 99,
      fontSize: compact ? 11 : 12,
      fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '-0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ opacity: 0.7, fontSize: 10, fontWeight: 700 }}>{c.label}</span>
      {value}{unit}
    </span>
  )
}

export default MacroPill
