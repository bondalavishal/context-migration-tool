// Perplexity AI HTML Parser
export function parsePerplexity(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  // Perplexity uses specific class patterns for queries and answers
  const queries = doc.querySelectorAll('[class*="query"], [class*="question"], [data-testid*="query"]')
  const answers = doc.querySelectorAll('[class*="answer"], [class*="prose"], [data-testid*="answer"]')

  if (queries.length > 0 || answers.length > 0) {
    const all = []
    queries.forEach(el => all.push({ role: 'user', el }))
    answers.forEach(el => all.push({ role: 'assistant', el }))
    all.sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el)
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
    all.forEach(({ role, el }) => {
      const content = el.innerText || el.textContent || ''
      if (content.trim()) turns.push({ role, content: content.trim() })
    })
    return turns
  }

  // Fallback
  const messages = doc.querySelectorAll('p, .prose')
  messages.forEach((el, i) => {
    const content = el.innerText || el.textContent || ''
    if (content.trim().length > 20) {
      turns.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: content.trim() })
    }
  })

  return turns
}
