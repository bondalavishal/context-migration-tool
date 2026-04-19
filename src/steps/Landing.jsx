export default function Landing({ goTo, STEPS }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
      }} />

      {/* Accent glow */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, #00ff8815 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '720px' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          padding: '4px 14px',
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          fontFamily: 'DM Mono, monospace',
        }}>
          Open Source · Free · No Backend
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
        }}>
          Context<br />
          <span style={{ color: 'var(--accent)' }}>Migration</span><br />
          Tool
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '3rem',
          maxWidth: '480px',
          margin: '0 auto 3rem',
        }}>
          Running out of tokens mid-project? Save your conversation from any AI model,
          compress what matters, and carry it to the next one.
        </p>

        {/* How it works */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          marginBottom: '3rem',
        }}>
          {[
            { n: '01', title: 'Save HTML', desc: 'Export your chat as an HTML file from any platform' },
            { n: '02', title: 'Compress', desc: 'We extract and compress what actually matters' },
            { n: '03', title: 'Continue', desc: 'Upload the output to any new AI and pick up where you left off' },
          ].map(s => (
            <div key={s.n} style={{
              background: 'var(--surface)',
              padding: '1.5rem',
              textAlign: 'left',
            }}>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                color: 'var(--accent)',
                marginBottom: '0.5rem',
              }}>{s.n}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => goTo(STEPS.API_KEY)}
          style={{
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            padding: '1rem 2.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => e.target.style.opacity = '0.85'}
          onMouseOut={e => e.target.style.opacity = '1'}
        >
          Get Started →
        </button>

        {/* Supported platforms */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontFamily: 'DM Mono, monospace',
        }}>
          Supports: ChatGPT · Claude · Gemini · Grok · Copilot · Perplexity
        </p>
      </div>
    </div>
  )
}
