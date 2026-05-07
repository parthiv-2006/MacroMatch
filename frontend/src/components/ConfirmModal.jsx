import { useState } from 'react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', showDontAskAgain = false, dontAskAgainKey = null }) => {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (dontAskAgain && dontAskAgainKey) {
      localStorage.setItem(`dontAsk_${dontAskAgainKey}`, 'true')
    }
    onConfirm()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
        width: '100%', maxWidth: 460,
        fontFamily: 'var(--font)',
      }}>
        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,.25)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--warn)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{message}</p>
            </div>
          </div>
        </div>

        {showDontAskAgain && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={e => setDontAskAgain(e.target.checked)}
                style={{ accentColor: 'var(--green)', width: 14, height: 14 }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Don't ask me again</span>
            </label>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
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
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
