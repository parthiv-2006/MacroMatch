import { useState } from 'react'
import MacroPill from './ui/MacroPill'
import MacroBar from './ui/MacroBar'

function SortAscIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  )
}
function SortDescIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

const sortOptions = [
  { label: 'Name', key: 'name' },
  { label: 'Quantity', key: 'quantity' },
  { label: 'Calories', key: 'calories' },
  { label: 'Protein', key: 'protein' },
  { label: 'Carbs', key: 'carbs' },
  { label: 'Fats', key: 'fats' },
]

const PantryList = ({ items, onDelete, onUpdate, onUpdateThreshold }) => {
  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  if (!items || items.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 24px', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', textAlign: 'center',
      }}>
        <div style={{ width: 56, height: 56, background: 'var(--surface2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v4H3V3zm2 6h14l-1 12H6L5 9zm4 2v8m6-8v8"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Your pantry is empty</h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 320, lineHeight: 1.6 }}>
          Add items to your inventory to start generating macro-aligned meals and get low stock alerts.
        </p>
      </div>
    )
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))
    setIsSortMenuOpen(false)
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key || !a.ingredient || !b.ingredient) return 0
    let valA, valB
    if (sortConfig.key === 'name') {
      valA = a.ingredient.name.toLowerCase()
      valB = b.ingredient.name.toLowerCase()
    } else if (['protein', 'carbs', 'fats', 'calories'].includes(sortConfig.key)) {
      valA = a.ingredient[sortConfig.key] * (a.quantity / 100)
      valB = b.ingredient[sortConfig.key] * (b.quantity / 100)
    } else if (sortConfig.key === 'quantity') {
      valA = a.quantity; valB = b.quantity
    } else {
      valA = a[sortConfig.key]; valB = b[sortConfig.key]
    }
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const startEditing = (item) => { setEditingId(item._id); setEditQty(item.quantity) }
  const cancelEditing = () => { setEditingId(null); setEditQty('') }
  const saveEdit = (id) => {
    if (editQty === '' || isNaN(editQty) || Number(editQty) < 0) return
    onUpdate(id, Number(editQty))
    setEditingId(null)
  }

  const thCol = (label, key) => {
    const active = sortConfig.key === key
    return (
      <th
        key={key}
        onClick={() => handleSort(key)}
        style={{
          padding: '10px 14px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: active ? 'var(--green)' : 'var(--text-3)',
          textAlign: 'left',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {label}
          {active && (
            <span style={{ color: 'var(--green)' }}>
              {sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
            </span>
          )}
        </span>
      </th>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Current Inventory</span>
          <span style={{
            fontSize: 11, fontWeight: 700, background: 'var(--surface2)',
            color: 'var(--text-3)', padding: '2px 8px', borderRadius: 99,
            border: '1px solid var(--border)',
          }}>{items.length}</span>
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsSortMenuOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '7px 12px',
              fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Sort: {sortOptions.find(o => o.key === sortConfig.key)?.label || 'Name'}
          </button>
          {isSortMenuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsSortMenuOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 4,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                zIndex: 20, minWidth: 160, overflow: 'hidden',
              }}>
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleSort(opt.key)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      width: '100%', padding: '9px 14px', textAlign: 'left',
                      fontSize: 13, fontWeight: sortConfig.key === opt.key ? 700 : 500,
                      color: sortConfig.key === opt.key ? 'var(--green)' : 'var(--text-2)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {opt.label}
                    {sortConfig.key === opt.key && (
                      sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {thCol('Item', 'name')}
                {thCol('Qty', 'quantity')}
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left' }}>Macros</th>
                {thCol('Cal', 'calories')}
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'left', width: 120 }}>Ratio</th>
                <th style={{ padding: '10px 14px', width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                if (!item.ingredient) return null
                const { ingredient, quantity } = item
                const ratio = quantity / 100
                const p = +(ingredient.protein * ratio).toFixed(1)
                const c = +(ingredient.carbs * ratio).toFixed(1)
                const f = +(ingredient.fats * ratio).toFixed(1)
                const cal = Math.round(ingredient.calories * ratio)
                const isEditing = item._id === editingId
                const isLast = idx === sortedItems.length - 1

                return (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Name */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ingredient.name}</span>
                        {item.isLowStock && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--warn)', background: 'var(--warn-bg)', padding: '2px 6px', borderRadius: 99, border: '1px solid rgba(245,158,11,.2)' }}>
                            LOW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '12px 14px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              value={editQty}
                              onChange={e => setEditQty(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(item._id); if (e.key === 'Escape') cancelEditing() }}
                              autoFocus
                              style={{
                                width: 70, padding: '5px 22px 5px 8px', fontSize: 13,
                                background: 'var(--surface2)', border: '1px solid var(--green)',
                                borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                                fontFamily: 'var(--mono)', outline: 'none',
                              }}
                            />
                            <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>g</span>
                          </div>
                          <button onClick={() => saveEdit(item._id)} style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'var(--green)', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font)' }}>Save</button>
                          <button onClick={cancelEditing} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{quantity}<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>g</span></span>
                      )}
                    </td>

                    {/* Macros */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <MacroPill type="protein" value={p} compact />
                        <MacroPill type="carbs" value={c} compact />
                        <MacroPill type="fat" value={f} compact />
                      </div>
                    </td>

                    {/* Cal */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cal)', fontFamily: 'var(--mono)' }}>{cal}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 3 }}>kcal</span>
                    </td>

                    {/* Ratio bar */}
                    <td style={{ padding: '12px 14px' }}>
                      <MacroBar protein={p} carbs={c} fat={f} size="sm" />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px' }}>
                      {!isEditing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={e => { e.stopPropagation(); startEditing(item) }}
                            title="Edit quantity"
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', transition: 'all .1s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-light)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onDelete(item._id) }}
                            title="Delete item"
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', transition: 'all .1s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fat)'; e.currentTarget.style.borderColor = 'var(--fat)'; e.currentTarget.style.background = 'var(--fat-bg)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PantryList
