// Compressor — Phase 3
// Applies compression rules based on content type labels from classifier.
// Uses groqClient for automatic model rotation — no fixed wait between chunks.

import { callGroq, ChunkTooLargeError } from './groqClient.js'

const KEEP_VERBATIM = ['code', 'decision', 'requirement', 'error']
const SUMMARIZE     = ['explanation', 'conversation']
const DISCARD       = ['redundant']

// Budget per chunk — sized against the weakest fallback model (llama-3.1-8b: 6K TPM)
const GROQ_TOKEN_BUDGET = 4000
const CHARS_PER_TOKEN   = 4
const CONTENT_TRUNCATE  = 500  // summarization needs more context than classification

function deduplicateTurns(turns) {
  const seen = new Set()
  return turns.filter(turn => {
    const key = turn.content.slice(0, 120).toLowerCase().replace(/\s+/g, ' ')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildBatchSummaryPrompt(groups) {
  const sections = groups.map((group, i) => {
    const text = group.map(t =>
      `[${t.role.toUpperCase()}]: ${t.content.slice(0, CONTENT_TRUNCATE)}`
    ).join('\n\n')
    return `=== GROUP ${i} ===\n${text}`
  }).join('\n\n')

  return `Summarize each GROUP of AI conversation turns in 2-4 concise sentences.
Focus on what was decided, asked, or clarified. Omit pleasantries.
Write in plain prose. No bullet points.

Respond ONLY with a JSON array of summary strings, one per group, in order.
Example: ["Summary of group 0.", "Summary of group 1."]

${sections}`
}

// Split groups into chunks that each fit within the token budget
function chunkGroupsByTokenBudget(groups) {
  const chunks = []
  let current = []
  let currentTokens = 0

  for (const group of groups) {
    const groupTokens = Math.ceil(
      group.reduce((sum, t) => sum + t.content.slice(0, CONTENT_TRUNCATE).length, 0) / CHARS_PER_TOKEN
    )
    if (current.length > 0 && currentTokens + groupTokens > GROQ_TOKEN_BUDGET) {
      chunks.push(current)
      current = []
      currentTokens = 0
    }
    current.push(group)
    currentTokens += groupTokens
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

// onProgress({ done, total, waitingUntil? })
export async function compress(classifiedTurns, apiKey, onProgress) {
  const deduped = deduplicateTurns(classifiedTurns)

  const verbatim = []
  const summary_groups = []
  let summaryBuffer = []

  function flushSummaryBuffer() {
    if (summaryBuffer.length > 0) {
      summary_groups.push([...summaryBuffer])
      summaryBuffer = []
    }
  }

  for (const turn of deduped) {
    if (DISCARD.includes(turn.type))   { flushSummaryBuffer(); continue }
    if (KEEP_VERBATIM.includes(turn.type)) { flushSummaryBuffer(); verbatim.push(turn) }
    else if (SUMMARIZE.includes(turn.type)) { summaryBuffer.push(turn) }
  }
  flushSummaryBuffer()

  if (summary_groups.length === 0) {
    onProgress?.({ done: 0, total: 0 })
    return { verbatim, summaries: [] }
  }

  // Separate short groups (no LLM needed) from groups that need summarizing
  const allSummaryTexts = new Array(summary_groups.length)
  const llmGroups = []
  const llmGroupIndexes = []

  summary_groups.forEach((group, i) => {
    const totalLength = group.reduce((sum, t) => sum + t.content.length, 0)
    if (totalLength < 300) {
      allSummaryTexts[i] = group.map(t => t.content).join(' ').slice(0, 300)
    } else {
      llmGroups.push(group)
      llmGroupIndexes.push(i)
    }
  })

  if (llmGroups.length > 0) {
    const chunks = chunkGroupsByTokenBudget(llmGroups)
    let done = 0
    let llmOffset = 0

    // Recursively process a chunk — if too large, split in half and retry
    async function processChunk(chunk, offset) {
      const maxTokens = Math.min(chunk.length * 120 + 50, 2048)
      try {
        const data = await callGroq(apiKey, buildBatchSummaryPrompt(chunk), maxTokens, (waitUntil) => {
          onProgress?.({ done, total: llmGroups.length, waitingUntil: waitUntil })
        })
        onProgress?.({ done, total: llmGroups.length })

        const text = data.choices?.[0]?.message?.content || '[]'
        let summaryTexts
        try {
          summaryTexts = JSON.parse(text.replace(/```json|```/g, '').trim())
        } catch {
          summaryTexts = chunk.map(() => '[Summary unavailable]')
        }

        chunk.forEach((_, bi) => {
          const globalIndex = llmGroupIndexes[offset + bi]
          allSummaryTexts[globalIndex] = summaryTexts[bi] || '[Summary unavailable]'
        })

        done += chunk.length
        onProgress?.({ done, total: llmGroups.length })
      } catch (e) {
        if (e instanceof ChunkTooLargeError && chunk.length > 1) {
          // Split in half and retry each half independently
          const mid = Math.floor(chunk.length / 2)
          await processChunk(chunk.slice(0, mid), offset)
          await processChunk(chunk.slice(mid), offset + mid)
        } else {
          throw e
        }
      }
    }

    for (let c = 0; c < chunks.length; c++) {
      await processChunk(chunks[c], llmOffset)
      llmOffset += chunks[c].length
    }
  }

  const summaries = allSummaryTexts.map(content => ({
    role: 'assistant',
    type: 'summary',
    content,
    compressed: true,
  }))

  return { verbatim, summaries }
}
