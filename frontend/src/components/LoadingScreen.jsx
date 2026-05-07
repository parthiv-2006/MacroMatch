const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { transform: scale(1); opacity: 0; }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); }
          50% { transform: scale(1); }
          100% { transform: scale(0.8); }
        }
        .mm-pulse-ring { animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .mm-pulse-dot  { animation: pulse-dot  1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; }
      `}</style>

      <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <div className="mm-pulse-ring" style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,.2)', borderRadius: '50%' }} />
        <div className="mm-pulse-ring" style={{ position: 'absolute', inset: 0, background: 'rgba(13,148,136,.2)', borderRadius: '50%', animationDelay: '0.4s' }} />
        <div className="mm-pulse-ring" style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,.1)', borderRadius: '50%', animationDelay: '0.8s' }} />
        <div className="mm-pulse-dot" style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#22c55e,#0d9488)', borderRadius: '50%', boxShadow: '0 0 16px rgba(34,197,94,.5)' }} />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#22c55e,#0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
        MacroMatch
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{message}</p>
    </div>
  )
}

export default LoadingScreen
