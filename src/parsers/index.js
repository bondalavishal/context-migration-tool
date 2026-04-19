import { parseChatGPT } from './chatgpt.js'
import { parseClaude } from './claude.js'
import { parseGemini } from './gemini.js'
import { parseGrok } from './grok.js'
import { parseCopilot } from './copilot.js'
import { parsePerplexity } from './perplexity.js'
import { parsePlainText } from './plaintext.js'

export { parsePlainText }

// Detect platform from HTML content using known fingerprints
export function detectPlatform(html) {
  if (html.includes('chat.openai.com') || html.includes('chatgpt.com') || html.includes('ChatGPT')) return 'chatgpt'
  if (html.includes('claude.ai') || html.includes('Anthropic')) return 'claude'
  if (html.includes('gemini.google.com') || html.includes('Google Gemini')) return 'gemini'
  if (html.includes('grok.x.ai') || html.includes('x.ai/grok') || html.includes('Grok')) return 'grok'
  if (html.includes('copilot.microsoft.com') || html.includes('Microsoft Copilot')) return 'copilot'
  if (html.includes('perplexity.ai') || html.includes('Perplexity')) return 'perplexity'
  return 'unknown'
}

// Route to the correct parser based on detected platform
export function parseHTML(html, platform) {
  switch (platform) {
    case 'chatgpt':    return parseChatGPT(html)
    case 'claude':     return parseClaude(html)
    case 'gemini':     return parseGemini(html)
    case 'grok':       return parseGrok(html)
    case 'copilot':    return parseCopilot(html)
    case 'perplexity': return parsePerplexity(html)
    default:           return genericHTMLParse(html)
  }
}

// Generic fallback — extracts all visible text blocks as best effort
function genericHTMLParse(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const text = doc.body?.innerText || doc.body?.textContent || ''
  return parsePlainText(text)
}
