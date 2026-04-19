import { useState, useRef } from 'react'
import { detectPlatform, parseHTML, parsePlainText } from '../parsers/index.js'

export default function Upload({ setUploadedFile, setDetectedPlatform, goTo, STEPS }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  function processFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['html', 'htm', 'txt'].includes(ext)) {
      setError('Please upload an .html or .txt file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      let turns = []
      let platform = 'unknown'

      if (ext === 'txt') {
        turns = parsePlainText(content)
        platform = 'plaintext'
      } else {
        platform = detectPlatform(content)
        turns = parseHTML(content, platform)
      }

      if (!turns || turns.length === 0) {
        setError('Could not parse any conversation turns from this file. Try saving as .txt.')
        return
      }

      setDetectedPlatform(platform)
      setUploadedFile({ name: file.name, turns, raw: content })
      goTo(STEPS.PROCESSING)
    }
    reader.readAsText(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
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
      <div style={{ width: '100%', maxWidth: '560px' }}>

        <button
          onClick={() => goTo(STEPS.API_KEY)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            marginBottom: '2rem', padding: 0,
          }}
        >← Back</button>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Upload Conversation
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Save your chat as an HTML file (Ctrl+S in browser) or paste it as a .txt file.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
          <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
            Drop your file here
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Mono, monospace' }}>
            .html · .htm · .txt
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm,.txt"
            style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--error)', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
            {error}
          </p>
        )}

        {/* Platform guide */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '1.25rem',
          marginTop: '1.5rem',
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'DM Mono, monospace',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
            letterSpacing: '0.1em',
          }}>HOW TO SAVE YOUR CHAT AS HTML</div>
          {[
            ['ChatGPT', 'Share → Copy link → Open link → Ctrl+S'],
            ['Claude', 'Open conversation → Ctrl+S in browser'],
            ['Gemini', 'Open conversation → Ctrl+S in browser'],
            ['Any platform', 'Copy-paste conversation into a .txt file'],
          ].map(([p, hint]) => (
            <div key={p} style={{
              display: 'flex', gap: '1rem',
              fontSize: '12px', marginBottom: '0.4rem',
              fontFamily: 'DM Mono, monospace',
            }}>
              <span style={{ color: 'var(--accent)', minWidth: '90px' }}>{p}</span>
              <span style={{ color: 'var(--text-muted)' }}>{hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
