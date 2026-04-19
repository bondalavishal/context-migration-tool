// Grok HTML Parser
export function parseGrok(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  const messages = doc.querySelectorAll('[class*="message"], [class*="turn"], [class*="bubble"]')
  messages.forEach((el, i) => {
    const role = i % 2 === 0 ? 'user' : 'assistant'
    const content = el.innerText || el.textContent || ''
    if (content.trim()) turns.push({ role, content: content.trim() })
  })

  return turns
}
