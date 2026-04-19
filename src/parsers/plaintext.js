// Plaintext Parser
// Handles raw copy-paste conversations saved as .txt
// Supports common formats: "User:", "Assistant:", "Human:", "Claude:", "You:", "AI:" prefixes

const USER_PATTERNS = /^(you|user|human|me)\s*[:>]/i
const ASSISTANT_PATTERNS = /^(assistant|ai|claude|chatgpt|gpt|gemini|grok|copilot|bot|model)\s*[:>]/i

export function parsePlainText(text) {
  const lines = text.split('\n')
  const turns = []
  let currentRole = null
  let currentLines = []

  function flush() {
    if (currentRole && currentLines.length > 0) {
      const content = currentLines.join('\n').trim()
      if (content) turns.push({ role: currentRole, content })
    }
    currentLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (USER_PATTERNS.test(trimmed)) {
      flush()
      currentRole = 'user'
      const content = trimmed.replace(USER_PATTERNS, '').trim()
      if (content) currentLines.push(content)
    } else if (ASSISTANT_PATTERNS.test(trimmed)) {
      flush()
      currentRole = 'assistant'
      const content = trimmed.replace(ASSISTANT_PATTERNS, '').trim()
      if (content) currentLines.push(content)
    } else {
      if (currentRole) {
        currentLines.push(line)
      }
    }
  }

  flush()

  // If no role markers found — try alternating paragraph blocks as fallback
  if (turns.length === 0) {
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    paragraphs.forEach((p, i) => {
      turns.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: p })
    })
  }

  return turns
}
