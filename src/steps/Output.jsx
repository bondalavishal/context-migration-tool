export default function Output({ result, detectedPlatform, goTo, STEPS }) {
  function download() {
    const blob = new Blob([result.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'context-snapshot.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  function copy() {
    navigator.clipboard.writeText(result.markdown)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Context Snapshot
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
              Source: {detectedPlatform || 'unknown'} · Ready to upload to any AI
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={copy}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '0.6rem 1.2rem',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
            <button
              onClick={download}
              style={{
                background: 'var(--accent)',
                border: 'none',
                color: '#000',
                padding: '0.6rem 1.2rem',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Download .md
            </button>
          </div>
        </div>

        {/* Preview */}
        <pre style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          fontFamily: 'DM Mono, monospace',
          fontSize: '12px',
          lineHeight: 1.7,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}>
          {result?.markdown || 'No output generated.'}
        </pre>

        {/* Start over */}
        <button
          onClick={() => goTo(STEPS.LANDING)}
          style={{
            marginTop: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Start over
        </button>

      </div>
    </div>
  )
}
