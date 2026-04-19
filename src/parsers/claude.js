// Claude.ai HTML Parser

export function parseClaude(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  // Claude uses data-testid attributes for human and assistant turns
  const humanTurns = doc.querySelectorAll('[data-testid="human-turn"]')
  const assistantTurns = doc.querySelectorAll('[data-testid="assistant-turn"]')

  if (humanTurns.length > 0 || assistantTurns.length > 0) {
    // Collect all turns with position to interleave correctly
    const all = []
    humanTurns.forEach(el => all.push({ role: 'user', el, pos: el.getBoundingClientRect?.()?.top || 0 }))
    assistantTurns.forEach(el => all.push({ role: 'assistant', el, pos: el.getBoundingClientRect?.()?.top || 0 }))
    all.sort((a, b) => a.pos - b.pos)
    all.forEach(({ role, el }) => {
      const content = el.innerText || el.textContent || ''
      if (content.trim()) turns.push({ role, content: content.trim() })
    })
    return turns
  }

  // Fallback: look for common Claude class patterns
  const messages = doc.querySelectorAll('.font-claude-message, .human-turn, .assistant-turn')
  messages.forEach((el, i) => {
    const isUser = el.className.includes('human') || i % 2 === 0
    const content = el.innerText || el.textContent || ''
    if (content.trim()) turns.push({ role: isUser ? 'user' : 'assistant', content: content.trim() })
  })

  return turns
}
