// Gemini HTML Parser
export function parseGemini(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  const messages = doc.querySelectorAll('message-content, .query-text, .response-container')
  messages.forEach((el, i) => {
    const role = el.classList.contains('query-text') || i % 2 === 0 ? 'user' : 'assistant'
    const content = el.innerText || el.textContent || ''
    if (content.trim()) turns.push({ role, content: content.trim() })
  })

  return turns
}
