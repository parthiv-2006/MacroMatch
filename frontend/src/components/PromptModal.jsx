import { useState } from 'react'

const PromptModal = ({ isOpen, onClose, onSubmit, title, message, placeholder = '', defaultValue = '', inputType = 'text' }) => {
  const [value, setValue] = useState(defaultValue)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value)
      onClose()
    }
  }

  const handleCancel = () => {
    setValue(defaultValue)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
        onClick={handleCancel}
      />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
        width: '100%', maxWidth: 460,
        fontFamily: 'var(--font)',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                background: 'var(--green-light)', border: '1px solid rgba(34,197,94,.2)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--green)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{title}</h3>
                {message && <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 14px', lineHeight: 1.5 }}>{message}</p>}
                <input
                  type={inputType}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: 13,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                    fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 600,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg,#16a34a,#0d9488)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                color: 'white', cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 2px 8px rgba(22,163,74,.3)', transition: 'opacity .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PromptModal
