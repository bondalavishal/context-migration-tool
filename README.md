<div align="center">

# CMT — Context Migration Tool

**Migrate AI conversation context between models. Free, open source, no backend.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Netlify](https://img.shields.io/badge/deployed-Netlify-00C7B7?logo=netlify)](https://www.netlify.com)

</div>

---

Running out of tokens mid-project? CMT lets you export a conversation from any major AI platform, intelligently compress it using Groq's free LLM API, and carry the relevant context to a new model — without starting from scratch.

Your API key never leaves your browser. No backend. No accounts. No data collection.

---

## How It Works

1. **Save your chat as HTML** — open your conversation's share link in a browser and press `Ctrl+S`
2. **Upload to CMT** — drag and drop the HTML or `.txt` file
3. **Enter your Groq API key** — free, no credit card required
4. **Get a context snapshot** — CMT classifies and compresses what matters into a `.md` file
5. **Continue anywhere** — upload the `.md` to any AI model and pick up where you left off

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
| Plain `.txt` | ✅ |

---

## How to Save Your Chat as HTML

| Platform | Steps |
|---|---|
| **ChatGPT** | Share conversation → copy link → open in browser → `Ctrl+S` → Save as HTML |
| **Claude** | Open conversation in browser → `Ctrl+S` → Save as HTML |
| **Gemini** | Open conversation in browser → `Ctrl+S` → Save as HTML |
| **Grok / Copilot / Perplexity** | Open conversation in browser → `Ctrl+S` → Save as HTML |
| **Any platform** | Copy-paste the conversation into a `.txt` file |

---

## Getting a Free Groq API Key

CMT uses [Groq](https://console.groq.com) to compress your conversation intelligently across a pool of models with automatic rate-limit rotation.

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up — no credit card required
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key and paste it into CMT — it stays in your browser only, never sent to any server

---

## Setup & Running Locally

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | 18 or higher | `node --version` |
| npm | comes with Node | `npm --version` |
| Git | any | `git --version` |

---

### macOS

**1. Install Node.js (if not installed)**

```bash
# Using Homebrew (recommended)
brew install node

# Or download directly from https://nodejs.org
```

Verify:
```bash
node --version   # should print v18 or higher
npm --version
```

**2. Clone the repository**

```bash
git clone https://github.com/your-username/cmt.git
cd cmt
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Windows

**1. Install Node.js**

- Download the LTS installer from [https://nodejs.org](https://nodejs.org)
- Run the `.msi` installer — accept all defaults
- Restart your terminal after installation

Verify (open Command Prompt or PowerShell):
```cmd
node --version
npm --version
```

**2. Install Git (if not installed)**

- Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
- Run the installer — accept all defaults
- Use **Git Bash** or **Windows Terminal** for the steps below

**3. Clone the repository**

```bash
git clone https://github.com/your-username/cmt.git
cd cmt
```

**4. Install dependencies**

```bash
npm install
```

**5. Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Windows note:** If you see a firewall prompt, click **Allow access**.

---

### Common Issues

| Problem | Fix |
|---|---|
| `node: command not found` | Node.js not installed or not in PATH — reinstall from nodejs.org |
| `npm install` fails with EACCES (macOS) | Run `sudo npm install` or fix npm permissions via [this guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) |
| Port 5173 already in use | Run `npm run dev -- --port 3000` to use a different port |
| Blank page in browser | Make sure you're opening `http://localhost:5173`, not the file directly |
| `zsh: command not found: npm` (macOS) | Run `source ~/.zshrc` or restart terminal after installing Node |

---

## Building for Production

```bash
npm run build
```

Output goes to the `dist/` folder. This is a fully static site — no server required.

**Preview the production build locally:**
```bash
npm run preview
```

---

## Deploying to Netlify

### Option A — Drag and Drop (quickest)

1. Run `npm run build`
2. Go to [netlify.com](https://www.netlify.com) → **Add new site** → **Deploy manually**
3. Drag the `dist/` folder into the deploy area
4. Done — you'll get a live URL instantly

### Option B — Connect GitHub repo (recommended)

1. Push this repo to GitHub
2. Go to [netlify.com](https://www.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub account and select the repo
4. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**

Every push to `main` will automatically redeploy.

---

## Creating a GitHub Repository and Pushing

**First time setup — create the repo and push:**

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Initial commit
git commit -m "Initial commit: CMT - Context Migration Tool"

# 4. Create a repo on GitHub at https://github.com/new
#    Name it: cmt
#    Keep it public, don't initialize with README

# 5. Add remote and push
git remote add origin https://github.com/your-username/cmt.git
git branch -M main
git push -u origin main
```

**Subsequent pushes:**

```bash
git add .
git commit -m "your message here"
git push
```

> Replace `your-username` with your actual GitHub username in the remote URL.

---

## Project Structure

```
cmt/
├── src/
│   ├── parsers/           # Platform-specific HTML parsers
│   │   ├── index.js       # Auto-detects platform and routes to correct parser
│   │   ├── chatgpt.js
│   │   ├── claude.js
│   │   ├── gemini.js
│   │   ├── grok.js
│   │   ├── copilot.js
│   │   ├── perplexity.js
│   │   └── plaintext.js
│   ├── steps/             # React UI step components
│   │   ├── Landing.jsx    # Welcome screen
│   │   ├── ApiKeyInput.jsx
│   │   ├── Upload.jsx
│   │   ├── Processing.jsx # Classify + compress pipeline
│   │   └── Output.jsx     # Download context snapshot
│   ├── groqClient.js      # Shared Groq API caller with model rotation
│   ├── classifier.js      # Phase 2: labels each turn by content type
│   ├── compressor.js      # Phase 3: summarizes or keeps turns verbatim
│   ├── exporter.js        # Phase 4: builds the final .md snapshot
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── netlify.toml
├── package.json
└── .env.example
```

---

## How the Compression Works

CMT processes your conversation in 4 phases:

| Phase | What happens |
|---|---|
| **1. Parse** | Detects platform, extracts all turns with roles |
| **2. Classify** | Labels each turn: `code`, `decision`, `requirement`, `error`, `explanation`, `conversation`, `redundant` |
| **3. Compress** | Keeps `code`/`decision`/`requirement`/`error` verbatim; summarizes `explanation`/`conversation`; drops `redundant` |
| **4. Export** | Assembles a structured `.md` snapshot with project goal, decisions, artifacts, and current state |

**Rate limit handling:** CMT rotates across all available Groq models automatically. If one hits its TPM limit, the next model is used instantly — no waiting unless all models are exhausted simultaneously (~224K combined TPM).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| LLM API | Groq (multi-model rotation) |
| Hosting | Netlify (static) |
| Language | JavaScript (ES modules) |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

Areas that need contribution:
- Improving platform-specific HTML parsers (UI structures change frequently)
- Adding new platform parsers
- Improving compression prompt quality
- UI improvements

---

## License

MIT — see [LICENSE](LICENSE) for details.
