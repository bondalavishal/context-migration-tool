// groqClient.js — shared Groq caller with automatic model rotation
// When a model hits its TPM rate limit, instantly falls back to the next model.
// Only waits if ALL models are rate-limited simultaneously.

// All viable models ordered by TPM capacity (best first).
// Excluded: llama-prompt-guard-2-22m and llama-prompt-guard-2-86m — these are
// safety/content-filtering classifiers and won't follow general instructions.
export const MODELS = [
  'groq/compound-mini',                        // 70K TPM (no daily token limit)
  'groq/compound',                             // 70K TPM (no daily token limit)
  'meta-llama/llama-4-scout-17b-16e-instruct', // 30K TPM
  'openai/gpt-oss-120b',                       // 8K TPM
  'openai/gpt-oss-20b',                        // 8K TPM
  'openai/gpt-oss-safeguard-20b',              // 8K TPM
  'llama-3.3-70b-versatile',                   // 12K TPM
  'allam-2-7b',                                // 6K TPM
  'llama-3.1-8b-instant',                      // 6K TPM
  'qwen/qwen3-32b',                            // 6K TPM
]

const RATE_LIMIT_WAIT = 62000 // ms — 1 min + 2s buffer

// Per-model cooldown tracking: modelIndex -> timestamp when it becomes available again
const cooldowns = {}

function availableModelIndex() {
  const now = Date.now()
  for (let i = 0; i < MODELS.length; i++) {
    if (!cooldowns[i] || cooldowns[i] <= now) return i
  }
  return null // all models on cooldown
}

function earliestAvailableAt() {
  return Math.min(...Object.values(cooldowns))
}

// Thrown when the chunk is too large for the model's context window.
// Callers should split their chunk in half and retry each half.
export class ChunkTooLargeError extends Error {
  constructor() {
    super('Chunk too large for context window')
    this.name = 'ChunkTooLargeError'
  }
}

// Context-window-exceeded messages from Groq (400 errors, not 413)
const CONTEXT_EXCEEDED_PATTERNS = [
  /please reduce the length/i,
  /context.?window/i,
  /maximum context length/i,
  /prompt is too long/i,
  /tokens? exceeds/i,
]

function isContextWindowError(message) {
  return CONTEXT_EXCEEDED_PATTERNS.some(p => p.test(message))
}

// onThrottle(waitUntilMs) — called when ALL models are rate-limited
export async function callGroq(apiKey, prompt, maxTokens, onThrottle) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const idx = availableModelIndex()

    if (idx === null) {
      // All models rate-limited — wait for the soonest one to recover
      const waitUntil = earliestAvailableAt()
      onThrottle?.(waitUntil)
      await new Promise(r => setTimeout(r, waitUntil - Date.now() + 500))
      continue
    }

    const model = MODELS[idx]
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (res.status === 429) {
      // This model is rate-limited — cool it down and immediately retry with next
      cooldowns[idx] = Date.now() + RATE_LIMIT_WAIT
      continue
    }

    if (res.status === 413) {
      // HTTP-level payload too large — split the chunk
      throw new ChunkTooLargeError()
    }

    if (!res.ok) {
      const err = await res.json()
      const message = err?.error?.message || ''
      if (isContextWindowError(message)) {
        // Model-level context window exceeded — split the chunk
        throw new ChunkTooLargeError()
      }
      throw new Error(`Groq API error: ${message || res.status}`)
    }

    return res.json()
  }
}
