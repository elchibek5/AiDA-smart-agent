AIDA (AI Developer Assistant) — MVP Monorepo

Structure
- backend — Node.js Express server that proxies to Ollama and streams responses (/ask, /ask/stream).
- extension — VS Code extension that opens a chat panel and streams from the backend.

Quick Start

Backend
cd backend
npm install
npm run dev

VS Code Extension
cd extension
npm install
npm run compile
Open in VS Code: fn+F5 → Dev Host → Cmd+Shift+P → "AIDA: Open Chat"
