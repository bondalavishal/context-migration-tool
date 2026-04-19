// Microsoft Copilot HTML Parser
export function parseCopilot(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  // Copilot uses cib-message or similar web components
  const userMessages = doc.querySelectorAll('cib-message[source="user"], [class*="user-message"], [data-source="user"]')
  const botMessages = doc.querySelectorAll('cib-message[source="bot"], [class*="bot-message"], [data-source="bot"]')

  if (userMessages.length > 0 || botMessages.length > 0) {
    const all = []
    userMessages.forEach(el => all.push({ role: 'user', el }))
    botMessages.forEach(el => all.push({ role: 'assistant', el }))
    // Re-sort by DOM order
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

  // Fallback: alternating messages
  const messages = doc.querySelectorAll('[class*="message"]')
  messages.forEach((el, i) => {
    const role = i % 2 === 0 ? 'user' : 'assistant'
    const content = el.innerText || el.textContent || ''
    if (content.trim()) turns.push({ role, content: content.trim() })
  })

  return turns
}
