# CMT — Context Migration Tool

> Migrate your AI conversation context between models. Free, open source, no backend.

Running out of tokens mid-project? CMT lets you export a conversation from any major AI platform, intelligently compress it, and carry the relevant context to a new model — without starting from scratch.

---

## How It Works

1. **Save your chat as HTML** — open your conversation's share link in a browser and press `Ctrl+S`
2. **Upload to CMT** — drag and drop the HTML file
3. **Get a context snapshot** — CMT classifies and compresses what matters
4. **Continue anywhere** — upload the `.md` output to any AI and pick up where you left off

---

## Supported Platforms

| Platform | Parser Status |
|---|---|
| ChatGPT | ✅ |
| Claude | ✅ |
| Gemini | ✅ |
| Grok | ✅ |
| Microsoft Copilot | ✅ |
| Perplexity | ✅ |
| Plain .txt | ✅ |

---

## How to Save Your Chat as HTML

**ChatGPT:**
Share conversation → copy link → open link in browser → `Ctrl+S` → Save as HTML

**Claude:**
Open conversation in browser → `Ctrl+S` → Save as HTML

**Gemini:**
Open conversation in browser → `Ctrl+S` → Save as HTML

**Any platform:**
Copy-paste the conversation into a `.txt` file — CMT handles that too.

---

## Getting a Free Cerebras API Key

CMT uses [Cerebras](https://cloud.cerebras.ai) to compress your conversation intelligently.

1. Go to [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Sign up — no credit card required
3. Generate an API key
4. Paste it into CMT — it stays in your browser only, never sent to our servers

---

## Running Locally

```bash
git clone https://github.com/your-username/cmt
cd cmt
npm install
npm run dev
```

---

## Deploying to Netlify

```bash
npm run build
# then drag the /dist folder to Netlify, or connect your GitHub repo
```

The `netlify.toml` file handles routing automatically.

---

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Cerebras API (Qwen 3 235B)
- Netlify (static hosting)

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

Areas that need contribution:
- Improving platform-specific HTML parsers (HTML structures change frequently)
- Adding new platform parsers
- Improving compression quality
- UI improvements

---

## License

MIT
