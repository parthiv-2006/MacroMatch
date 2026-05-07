const PageHeader = ({ eyebrow, title, desc, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
    <div>
      {eyebrow && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
        {title}
      </h1>
      {desc && (
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4, fontWeight: 400 }}>
          {desc}
        </p>
      )}
    </div>
    {action && <div style={{ flexShrink: 0, marginLeft: 16 }}>{action}</div>}
  </div>
)

export default PageHeader
