import { useEffect, useState, useRef } from 'react'
import { classify } from '../classifier.js'
import { compress } from '../compressor.js'
import { exportToMarkdown } from '../exporter.js'

export default function Processing({ apiKey, uploadedFile, detectedPlatform, setResult, goTo, STEPS }) {
  const [stage, setStage] = useState(0)
  const [classifyProgress, setClassifyProgress] = useState(null)
  const [compressProgress, setCompressProgress] = useState(null)
  const [countdown, setCountdown] = useState(null) // seconds remaining in rate-limit wait
  const countdownRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => { run() }, [])

  function startCountdown(waitUntilMs) {
    if (countdownRef.current) clearInterval(countdownRef.current)
    const tick = () => {
      const secs = Math.ceil((waitUntilMs - Date.now()) / 1000)
      if (secs <= 0) {
        setCountdown(null)
        clearInterval(countdownRef.current)
      } else {
        setCountdown(secs)
      }
    }
    tick()
    countdownRef.current = setInterval(tick, 500)
  }

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current) }, [])

  async function run() {
    try {
      setStage(0)
      const turns = uploadedFile.turns

      setStage(1)
      const classified = await classify(turns, apiKey, (p) => {
        setClassifyProgress(p)
        if (p.waitingUntil) startCountdown(p.waitingUntil)
        else setCountdown(null)
      })

      setCountdown(null)
      setStage(2)
      const compressed = await compress(classified, apiKey, (p) => {
        setCompressProgress(p)
        if (p.waitingUntil) startCountdown(p.waitingUntil)
        else setCountdown(null)
      })

      setCountdown(null)
      setStage(3)
      const markdown = exportToMarkdown(compressed, detectedPlatform)

      setResult({ markdown, compressed })
      goTo(STEPS.OUTPUT)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please check your API key and try again.')
    }
  }

  const STAGES = [
    { label: 'Parsing conversation turns', progress: null },
    { label: 'Classifying content types',  progress: classifyProgress },
    { label: 'Compressing with Groq',      progress: compressProgress },
    { label: 'Building context snapshot',  progress: null },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>

        {!error ? (
          <>
            {/* Spinner — pulse orange during countdown */}
            <div style={{
              width: '48px', height: '48px',
              border: '2px solid var(--border)',
              borderTop: `2px solid ${countdown ? '#f97316' : 'var(--accent)'}`,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 2rem',
              transition: 'border-top-color 0.3s',
            }} />

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Processing
            </h2>

            {/* Rate limit countdown banner */}
            {countdown !== null && (
              <div style={{
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '1rem',
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                color: '#f97316',
              }}>
                ⏱ Rate limit pause — resuming in {countdown}s
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {STAGES.map((s, i) => {
                const isDone   = i < stage
                const isActive = i === stage
                const p        = s.progress

                return (
                  <div key={s.label}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '12px',
                      color: isDone ? 'var(--accent)' : isActive ? 'var(--text)' : 'var(--text-muted)',
                      transition: 'color 0.3s',
                    }}>
                      <span>{isDone ? '✓' : isActive ? '›' : '○'} {s.label}</span>

                      {isActive && p && !p.waitingUntil && (
                        <span style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '11px',
                          color: 'var(--accent)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {p.done}/{p.total}
                        </span>
                      )}

                      {isDone && p && (
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--accent)',
                          opacity: 0.6,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {p.total} done
                        </span>
                      )}
                    </div>

                    {isActive && p && !p.waitingUntil && (
                      <div style={{
                        marginTop: '4px',
                        height: '2px',
                        background: 'var(--border)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.round((p.done / p.total) * 100)}%`,
                          background: 'var(--accent)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--error)' }}>
              Error
            </h2>
            <p style={{
              color: 'var(--text-muted)',
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>{error}</p>
            <button
              onClick={() => goTo(STEPS.UPLOAD)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '0.75rem 1.5rem',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >← Try Again</button>
          </>
        )}
      </div>
    </div>
  )
}
