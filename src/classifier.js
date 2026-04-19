// Classifier — Phase 2
// Labels each conversation turn with a content type.
// Uses a rule-based pre-pass for obvious cases, then Groq for the rest.
// Uses groqClient for automatic model rotation — no fixed wait between chunks.

import { callGroq, ChunkTooLargeError } from './groqClient.js'

const CONTENT_TYPES = ['code', 'decision', 'requirement', 'error', 'explanation', 'conversation', 'redundant']

// Budget per chunk — sized against the weakest fallback model (llama-3.1-8b: 6K TPM)
// so any single model can handle a chunk without hitting its own limit.
const GROQ_TOKEN_BUDGET = 4000
const CHARS_PER_TOKEN   = 4
const CONTENT_TRUNCATE  = 150  // chars per turn — enough to classify, keeps tokens low

function ruleBasedClassify(turn) {
  const c = turn.content
  if (/```[\s\S]*```/.test(c)) return 'code'
  if (/^\s{4,}\S/m.test(c) && c.split('\n').length > 4) return 'code'
  if (/error|exception|traceback|at line \d+|undefined is not/i.test(c) && c.length < 1000) return 'error'
  if (turn.role === 'user' && c.length < 300 && /\b(must|should|need|want|require|make sure|ensure|always|never)\b/i.test(c)) return 'requirement'
  return null
}

function buildClassificationPrompt(turns) {
  const items = turns.map((t, i) =>
    `[${i}] role=${t.role}\n${t.content.slice(0, CONTENT_TRUNCATE)}${t.content.length > CONTENT_TRUNCATE ? '...' : ''}`
  ).join('\n\n---\n\n')

  return `You are classifying conversation turns from an AI chat session.
For each turn below, assign exactly ONE label from this list:
- code: contains or is about code, scripts, functions, schemas
- decision: a conclusion, architectural choice, or agreed approach
- requirement: a stated goal, constraint, or specification
- error: a bug, error message, stack trace, or debug output
- explanation: the AI explaining a concept or approach
- conversation: general back-and-forth, clarifying questions, pleasantries
- redundant: repeated content already covered earlier

Respond ONLY with a JSON array of labels in order, one per turn.
Example: ["code","explanation","conversation"]

Turns to classify:
${items}`
}

function chunkByTokenBudget(turns) {
  const chunks = []
  let current = []
  let currentTokens = 0

  for (const item of turns) {
    const itemTokens = Math.ceil(
      (item.turn.content.slice(0, CONTENT_TRUNCATE).length + 30) / CHARS_PER_TOKEN
    )
    if (current.length > 0 && currentTokens + itemTokens > GROQ_TOKEN_BUDGET) {
      chunks.push(current)
      current = []
      currentTokens = 0
    }
    current.push(item)
    currentTokens += itemTokens
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

// onProgress({ done, total, waitingUntil? })
export async function classify(turns, apiKey, onProgress) {
  const results = turns.map(turn => ({
    ...turn,
    type: ruleBasedClassify(turn),
  }))

  const needsLLM = results
    .map((r, i) => ({ i, turn: r }))
    .filter(r => r.turn.type === null)

  if (needsLLM.length === 0) {
    onProgress?.({ done: turns.length, total: turns.length })
    return results
  }

  let done = 0

  // Recursively process a chunk — if too large, split in half and retry
  async function processChunk(chunk) {
    const prompt = buildClassificationPrompt(chunk.map(r => r.turn))
    try {
      const data = await callGroq(apiKey, prompt, 512, (waitUntil) => {
        onProgress?.({ done, total: needsLLM.length, waitingUntil: waitUntil })
      })
      onProgress?.({ done, total: needsLLM.length })

      const text = data.choices?.[0]?.message?.content || '[]'
      let labels
      try {
        labels = JSON.parse(text.replace(/```json|```/g, '').trim())
      } catch {
        labels = chunk.map(() => 'conversation')
      }

      chunk.forEach(({ i }, bi) => {
        const label = labels[bi]
        results[i].type = CONTENT_TYPES.includes(label) ? label : 'conversation'
      })

      done += chunk.length
      onProgress?.({ done, total: needsLLM.length })
    } catch (e) {
      if (e instanceof ChunkTooLargeError && chunk.length > 1) {
        // Split in half and retry each half independently
        const mid = Math.floor(chunk.length / 2)
        await processChunk(chunk.slice(0, mid))
        await processChunk(chunk.slice(mid))
      } else {
        throw e
      }
    }
  }

  const chunks = chunkByTokenBudget(needsLLM)
  for (const chunk of chunks) {
    await processChunk(chunk)
  }

  return results
}
