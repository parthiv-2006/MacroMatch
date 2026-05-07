const MacroBar = ({ protein = 0, carbs = 0, fat = 0, size = 'md' }) => {
  const total = (protein + carbs + fat) || 1
  const h = size === 'sm' ? 4 : 6
  return (
    <div style={{ display: 'flex', height: h, borderRadius: 99, overflow: 'hidden', gap: 1, background: 'var(--border)' }}>
      <div style={{ width: `${(protein / total) * 100}%`, background: 'var(--protein)', borderRadius: '99px 0 0 99px', minWidth: protein > 0 ? 2 : 0 }} />
      <div style={{ width: `${(carbs / total) * 100}%`, background: 'var(--carbs)', minWidth: carbs > 0 ? 2 : 0 }} />
      <div style={{ width: `${(fat / total) * 100}%`, background: 'var(--fat)', borderRadius: '0 99px 99px 0', minWidth: fat > 0 ? 2 : 0 }} />
    </div>
  )
}

export default MacroBar
