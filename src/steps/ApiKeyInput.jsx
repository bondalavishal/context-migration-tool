import { useState } from 'react'

export default function ApiKeyInput({ apiKey, setApiKey, goTo, STEPS }) {
  const [value, setValue] = useState(apiKey)
  const [error, setError] = useState('')

  function handleContinue() {
    if (!value.trim()) {
      setError('Please enter your Groq API key.')
      return
    }
    if (!value.startsWith('gsk_')) {
      setError('Groq API keys start with gsk_ — please double check.')
      return
    }
    setApiKey(value.trim())
    goTo(STEPS.UPLOAD)
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
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <button
          onClick={() => goTo(STEPS.LANDING)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            marginBottom: '2rem', padding: 0,
          }}
        >← Back</button>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Your API Key
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          We use Groq (free, no credit card) to intelligently compress your conversation.
          Your key is used only in your browser — never sent to our servers.
        </p>

        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            border: '1px solid var(--border)',
            color: 'var(--accent)',
            padding: '6px 14px',
            fontSize: '12px',
            fontFamily: 'DM Mono, monospace',
            marginBottom: '1.5rem',
            textDecoration: 'none',
          }}
        >
          Get a free Groq key →
        </a>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontFamily: 'DM Mono, monospace',
            color: 'var(--text-muted)',
            marginBottom: '0.5rem',
            letterSpacing: '0.05em',
          }}>
            GROQ API KEY
          </label>
          <input
            type="password"
            placeholder="gsk_..."
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
              color: 'var(--text)',
              padding: '0.85rem 1rem',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {error && (
            <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '0.4rem', fontFamily: 'DM Mono, monospace' }}>
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            padding: '0.9rem',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          Continue →
        </button>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'DM Mono, monospace',
          lineHeight: 1.6,
        }}>
          Your key stays in memory only. It is never stored, logged, or transmitted to any server other than Groq directly.
        </p>
      </div>
    </div>
  )
}
