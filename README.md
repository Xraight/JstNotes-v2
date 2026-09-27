<div align="center">

# 🧠 JstNotes (Cognito IDE)
### The Cognitive Learning & Research Workstation

[![CI Quality Gate](https://github.com/Xraight/JstNotes-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/Xraight/JstNotes-v2/actions/workflows/ci.yml)
[![Desktop Releases](https://github.com/Xraight/JstNotes-v2/actions/workflows/release-desktop.yml/badge.svg)](https://github.com/Xraight/JstNotes-v2/actions/workflows/release-desktop.yml)
[![Container Release](https://github.com/Xraight/JstNotes-v2/actions/workflows/release-container.yml/badge.svg)](https://github.com/Xraight/JstNotes-v2/actions/workflows/release-container.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0--beta.1-rose.svg)](https://github.com/Xraight/JstNotes-v2/releases)

**A unified, offline-first personal learning environment bridging mathematical derivation, live document highlighting, active recall, knowledge graphs, and real-time AI critique.**

[Desktop Downloads](#-downloads--releases) • [Features](#-features) • [Docker Deployment](#-docker--container-deployment) • [Local Development](#-local-development) • [Documentation](DEPLOYMENT.md)

</div>

---

## 📖 Overview

Most note-taking applications treat reading, writing, and memorizing as disconnected steps. **JstNotes (Cognito IDE)** is engineered as a distraction-free, IDE-style workstation where:
* Academic papers and PDFs are directly synchronized with your Markdown and LaTeX notes.
* Concepts are automatically surfaced into a spaced-repetition flashcard queue (SuperMemo SM-2).
* Relationships between notes, tags, and citations form an interactive physical force graph.
* The **Feynman Technique** is built-in: explain any concept in plain language, and an AI tutor streams real-time critique to expose gaps in your mental model.

---

## ✨ Features

### 📄 1. Synchronized Split-Screen PDF Reader
* **Pixel-Accurate Text Selection & Highlights**: Highlight text in multiple academic colors with coordinate persistence.
* **Proportional Vector Zooming (30% to 400%)**: Zooming scales typography, equations, and highlight bounding boxes with mathematical accuracy—no misalignment or clipped viewports.
* **Bidirectional Citations**: Link any PDF page or excerpt into your notes with one click. Clicking a citation (`[citation:paper-id#p=3]`) jumps straight to the exact page and highlight in the reader.

### 📝 2. Technical Markdown & LaTeX Math Engine
* **High-Performance KaTeX Rendering**: Full support for inline equations ($E=mc^2$) and multi-line block derivations:
  $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
* **IDE Editing Experience**: Bidirectional `@-mentions` between notes, task lists, code syntax blocks, and table formatting.
* **Clean Document Structure**: Collapsible outlines, word counters, and instant tag filtering.

### 🧠 3. Active Recall & Spaced Repetition (SuperMemo SM-2)
* **Embedded Flashcard Decks**: Turn notes into study decks with a single shortcut.
* **Algorithmic Review Intervals**: Cards automatically schedule based on the SM-2 algorithm (Easiness Factor, Interval, and Repetitions) with Again, Hard, Good, and Easy ratings.
* **Session Metrics**: Visual review queues, streak tracking, and celebratory review completions.

### 🔬 4. Feynman Technique AI Coach (Streaming Feedback)
* **Real-Time Mental Model Critiques**: Write an explanation of a concept as if teaching a beginner.
* **Streaming Analysis**: Uses Server-Sent Events (SSE) to stream instant token-by-token feedback:
  * Detects hidden jargon and circular reasoning.
  * Identifies factual gaps and false assumptions.
  * Suggests intuitive real-world analogies.
* **Multi-Provider Support**: Connects to Google Gemini (built-in default), Groq (Llama 3.3 70B Versatile), OpenAI (GPT-4o), or custom local endpoints.

### 🕸️ 5. Interactive D3 Knowledge Graph
* **Dynamic Physics Simulation**: Visualizes the neural topology of your notes, tags, and citations.
* **Tag & Cluster Filtering**: Filter by subject or tag, hover to see relational connections, and double-click any node to jump directly into the note editor.

### 🎨 6. Modern Adaptive Themes (WCAG AAA Compliant)
* **Dark Themes**: Tokyo Night, Synthwave Neon, Cyberpunk, and Forest Green.
* **High-Contrast Light Themes**:
  * **Solarized Light**: Designed for daylight reading with high-contrast crimson rose accents (>7:1 contrast ratio) and warm paper backgrounds.
  * **Nord Snow**: Clean, minimalist cold-white palette.

### 🔒 7. Privacy-First & Offline-Ready
* **Local-First Architecture**: Your notes, flashcards, and PDFs are stored locally on your device.
* **Zero Telemetry**: No tracking, no forced accounts, no vendor lock-in.
* **Full Data Ownership**: 1-click JSON backup and restore, plus an on-demand **Sample Knowledge Base** loader in Settings for testing and onboarding.

---

## 📦 Downloads & Releases

Pre-compiled desktop applications are available on the [**GitHub Releases**](https://github.com/Xraight/JstNotes-v2/releases) page:

### 🐧 Linux (.AppImage)
1. Download `JstNotes-v2-<version>-x86_64.AppImage`.
2. Make it executable:
   ```bash
   chmod +x JstNotes-v2-*.AppImage
   ```
3. Run the application:
   ```bash
   ./JstNotes-v2-*.AppImage
   ```
*(Compatible with Ubuntu, Debian, Fedora, Arch Linux, and any distribution supporting AppImage).*

### 🪟 Windows (.exe)
1. Download `JstNotes-v2-Setup-<version>.exe` (Installer) or `JstNotes-v2-<version>-portable.exe` (Standalone).
2. Run the executable to install or launch immediately without installation.

---

## 🐳 Docker & Container Deployment

JstNotes is published as a multi-arch container image (`linux/amd64`, `linux/arm64`) on GitHub Container Registry.

### One-Line Run
```bash
docker run -d \
  --name jstnotes \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your-optional-key" \
  --restart unless-stopped \
  ghcr.io/xraight/jstnotes-v2:latest
```
Access the application at `http://localhost:3000`.

### Production Docker Compose
We provide a hardened production compose file with memory limits and log rotation:

```bash
# Clone the repository
git clone https://github.com/Xraight/JstNotes-v2.git
cd JstNotes-v2

# Start the service
docker compose -f deploy/compose.prod.yaml up -d
```

For complete production guides including **Caddy (Auto-HTTPS)**, **Nginx with unbuffered SSE**, and **Systemd service units**, see [**DEPLOYMENT.md**](DEPLOYMENT.md).

---

## 💻 Local Development

### Prerequisites
* **Node.js**: v20.x or v22.x+
* **npm**: v10.x+

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/Xraight/JstNotes-v2.git
cd JstNotes-v2

# 2. Install dependencies
npm install

# 3. Create .env configuration (optional)
cp .env.example .env

# 4. Start local development server (Vite + Express)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Desktop Development
```bash
# Run the desktop application in development mode
npm run electron:dev

# Build the desktop packages locally
npm run electron:dist:linux   # Builds .AppImage on Linux
npm run electron:dist:win     # Builds .exe on Windows
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global Fast Search & Command Palette |
| `Ctrl + N` / `Cmd + N` | Create New Note |
| `Ctrl + +` / `Ctrl + =` | Zoom In PDF Document (10% step) |
| `Ctrl + -` | Zoom Out PDF Document (10% step) |
| `Ctrl + 0` | Reset PDF Zoom to 100% |
| `Space` / `Enter` | Flip Flashcard in Active Recall Mode |
| `1` / `2` / `3` / `4` | Flashcard Rating (Again, Hard, Good, Easy) |

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4
* **Math & Typography**: KaTeX, JetBrains Mono, Inter
* **Data Visualization**: D3.js (Force-directed physics graph)
* **Backend Server**: Express 4, Server-Sent Events (SSE), `@google/genai`
* **Desktop Runtime**: Electron 44, `electron-builder`
* **Containerization**: Podman / Docker OCI, Alpine Linux, `tini` PID 1 init

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
