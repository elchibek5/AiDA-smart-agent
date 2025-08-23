# AIDA — AI Developer Assistant (Monorepo)

AIDA is a minimal, runnable MVP that pairs a **Node.js Express backend** with a **VS Code extension** featuring an inline chat webview.

## Monorepo Structure
aida/
├─ backend/ # Node.js Express API (MVP chat + health/meta)
└─ extension/ # VS Code extension (webview UI + commands)

## Prerequisites
- Node.js v18+ (v22 OK)
- VS Code (latest)
- macOS/Linux/Windows
- (Optional) Ollama on `http://localhost:11434` if you wire local models

---

## Quick Start (Developer Loop)

### 1) Run Backend (default port: **3001**)
```bash
cd ~/aida/backend
npm install
npm run dev
Verify:
curl -i http://localhost:3001/
# Optional if added:
curl -i http://localhost:3001/healthz
2) Build & Watch Extension
cd ~/aida/extension
npm install
npm run compile
npm run watch
3) Launch Extension Dev Host
open -a "Visual Studio Code" --args --disable-extensions --extensionDevelopmentPath="$HOME/aida/extension"
Then in the Extension Development Host:
Cmd+Shift+P → run your command (e.g., “AIDA: Open Chat”)
Use the chat UI; it will fetch the backend at http://localhost:3001
If your extension has a setting like aida.backendUrl, set it to http://localhost:3001.
Root Orchestrator (Optional)
You can add a root package.json with workspaces and run both watchers together:
cd ~/aida
npm install
npm run dev
You still launch the Dev Host using the command above.
Backend Endpoints (MVP)
GET / → { ok: true, service, version }
GET /healthz → { ok: true } (if added)
POST /chat → { reply: "..." } (if implemented in your API)
If /chat is not yet implemented, use the stub in your extension until the backend contract is finalized.
Packaging the Extension (Local Install)
npm i -g @vscode/vsce
cd ~/aida/extension
vsce package
code --install-extension ./aida-*.vsix
Troubleshooting
Backend not reachable
Confirm it’s listening:
lsof -iTCP -sTCP:LISTEN -nP | grep -E ':3001'
Verify JSON:
curl -H "Origin: http://localhost" -i http://localhost:3001/
Webview CORS
Backend should include Access-Control-Allow-Origin: * for dev.
If requests fail, open DevTools in the Extension Dev Host (Cmd+Alt+I) and check Network errors.
Port mismatch
The backend defaults to 3001. To override:
PORT=3030 npm run dev
Then update your extension setting/URL accordingly.
Contributing (Internal)
Keep all code formatted (prettier).
Keep the API contract documented in this README when changed.
Use small commits with conventional messages.
License
Proprietary for now. Update this section when ready.
