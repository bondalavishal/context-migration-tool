// ChatGPT HTML Parser
// Targets shared conversation pages from chat.openai.com

export function parseChatGPT(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const turns = []

  // ChatGPT share pages use article elements or data-message-author-role attributes
  const messages = doc.querySelectorAll('[data-message-author-role]')

  if (messages.length > 0) {
    messages.forEach(el => {
      const role = el.getAttribute('data-message-author-role')
      const content = el.innerText || el.textContent || ''
      if (content.trim()) {
        turns.push({ role: role === 'user' ? 'user' : 'assistant', content: content.trim() })
      }
    })
    return turns
  }

  // Fallback: look for article elements
  const articles = doc.querySelectorAll('article')
  if (articles.length > 0) {
    articles.forEach((el, i) => {
      const role = i % 2 === 0 ? 'user' : 'assistant'
      const content = el.innerText || el.textContent || ''
      if (content.trim()) {
        turns.push({ role, content: content.trim() })
      }
    })
    return turns
  }

  return []
}
