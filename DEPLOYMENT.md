# JstNotes-v2 (Cognito IDE) — Production Deployment Guide

This guide covers everything required to deploy **JstNotes-v2** professionally in a production environment, configure CI/CD via GitHub Actions, set up automated TLS/SSL, and manage persistent data.

---

## 🏛️ Architecture Overview

JstNotes is architected as an optimized, single-container full-stack application:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4 + KaTeX + D3.js. Built into an immutable, static bundle in `dist/`.
- **Backend**: Lightweight Node 22 + Express API server bundled with esbuild into `dist/server.cjs`.
- **Streaming**: Native Server-Sent Events (SSE) for real-time Feynman AI streaming.
- **Port**: Default is `3000` (configurable via `PORT` environment variable).
- **Healthcheck**: `GET /api/health` returns HTTP 200 `{"status":"ok"}`.

---

## 🚀 Deployment Options

### Option 1: Docker / Podman (Recommended for Quick Deploy)

#### Build and run locally:
```bash
# 1. Build image
podman build -t jstnotes-v2:latest -f Containerfile .

# 2. Run container
podman run -d \
  --name jstnotes-v2 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-key" \
  --restart unless-stopped \
  jstnotes-v2:latest
```

---

### Option 2: Docker Compose with Automated HTTPS (Caddy)

Caddy automatically handles Let's Encrypt SSL certificates, HTTP/2/3, and real-time streaming without manual certificate renewals.

1. Clone repository on your VPS:
```bash
git clone https://github.com/your-username/JstNotes-v2.git /opt/jstnotes
cd /opt/jstnotes
```

2. Create your `.env` file:
```bash
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY or other provider keys
```

3. Configure domain in `deploy/Caddyfile`:
```caddy
notes.yourdomain.com {
    encode zstd gzip
    reverse_proxy jstnotes:3000 {
        flush_interval -1
    }
}
```

4. Launch services:
```bash
docker compose -f deploy/compose.prod.yaml up -d
```

---

### Option 3: Nginx Reverse Proxy with SSL

If your infrastructure uses Nginx:
1. Copy the prepared config:
```bash
sudo cp deploy/nginx/jstnotes.conf /etc/nginx/sites-available/jstnotes.conf
sudo ln -s /etc/nginx/sites-available/jstnotes.conf /etc/nginx/sites-enabled/
```
2. Edit `server_name` to match your domain.
3. Obtain Let's Encrypt certificate:
```bash
sudo certbot --nginx -d notes.yourdomain.com
```
4. Verify and reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

> [!IMPORTANT]
> **SSE Buffering**: The Nginx configuration in `deploy/nginx/jstnotes.conf` explicitly disables proxy buffering (`proxy_buffering off;`) for `/api/ai/feynman/stream`. Without this, Nginx will buffer AI stream chunks and display the critique all at once instead of word-by-word.

---

### Option 4: Google Cloud Run (Serverless)

JstNotes is 100% Cloud Run ready:
```bash
# Build and submit container to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/jstnotes-v2

# Deploy to Cloud Run
gcloud run deploy jstnotes-v2 \
  --image gcr.io/YOUR_PROJECT_ID/jstnotes-v2 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=projects/YOUR_PROJECT_ID/secrets/gemini-api-key/versions/latest" \
  --port 3000 \
  --memory 1Gi \
  --cpu 1
```

---

## 🤖 GitHub Actions CI/CD Pipeline

The repository includes two automated workflows in `.github/workflows/`:

### 1. Continuous Integration (`ci.yml`)
- **Trigger**: Every pull request and push to `main` / `master`.
- **Actions**:
  - `npm run typecheck` (`tsc --noEmit`)
  - `npm run build` (compiles Vite + esbuild bundles)
  - **Smoke Test**: Spins up the server in background, queries `/api/health`, and verifies `status: "ok"`.

### 2. Multi-Architecture Container Release (`release-container.yml`)
- **Trigger**: Git tags (`v1.0.0-beta.1`) or manual trigger via GitHub Actions tab.
- **Platforms**: Builds native multi-arch OCI images for both `linux/amd64` and `linux/arm64` (Apple Silicon, AWS Graviton, Raspberry Pi).
- **Registry**: Publishes directly to **GitHub Container Registry** (`ghcr.io/<your-username>/jstnotes-v2:latest`).

#### Enabling GitHub Container Registry Publishing:
1. In your GitHub repository, navigate to **Settings ➔ Actions ➔ General ➔ Workflow permissions**.
2. Select **Read and write permissions**.
3. Push a version tag:
```bash
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```
4. GitHub Actions will build and publish your container image automatically.

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Port for the HTTP server (default: `3000`). |
| `NODE_ENV` | Yes | Set to `production` for static asset serving and caching. |
| `GEMINI_API_KEY` | Optional* | Server-side Google Gemini API key. Users can also provide their own key in Settings. |
| `GROQ_API_KEY` | Optional | Server-side Groq API key for Llama 3 models. |
| `OPENAI_API_KEY` | Optional | Server-side OpenAI API key. |
| `OPENCODE_API_KEY`| Optional | Server-side OpenCode API key. |

*\*Note: If server-side API keys are omitted, users can enter their personal API keys directly in the client-side Settings modal.*

---

## 💾 Data Persistence & First-Run Experience

- **Clean First Run**: Fresh instances initialize with only a clean **Welcome & Quickstart Guide** note, empty PDF library, and empty highlights.
- **Sample Knowledge Base**: Users can populate a full demonstration library (Cognitive Neuroscience & Quantum Computing notes, simulated PDFs, SM-2 flashcard decks) at any time by going to **Settings ➔ Backup & Reset ➔ Load Sample Knowledge Base**.
- **Backup & Export**: The entire knowledge base (notes, LaTeX formulas, PDF annotations, flashcard retention history) exports as a single portable JSON file from **Settings ➔ Backup ➔ Download Backup JSON**.
