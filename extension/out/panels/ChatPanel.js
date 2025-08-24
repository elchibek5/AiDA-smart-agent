"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanel = void 0;
const vscode = __importStar(require("vscode"));
function makeNonce(len = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let s = '';
    for (let i = 0; i < len; i++)
        s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s; // base64-like, safe for CSP nonces
}
class ChatPanel {
    constructor(panel, extUri) {
        this.disposables = [];
        this.panel = panel;
        const cfg = vscode.workspace.getConfiguration('aida');
        const backendUrl = cfg.get('backendUrl') || 'http://localhost:3001';
        this.panel.webview.options = { enableScripts: true };
        this.panel.title = 'AIDA Chat';
        this.panel.webview.html = this.getHtml(this.panel.webview, extUri, backendUrl);
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }
    static show(context) {
        const column = vscode.ViewColumn.Beside;
        if (ChatPanel.current) {
            ChatPanel.current.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('aidaChat', 'AIDA Chat', column, { enableScripts: true });
        ChatPanel.current = new ChatPanel(panel, context.extensionUri);
    }
    dispose() {
        ChatPanel.current = undefined;
        while (this.disposables.length) {
            try {
                this.disposables.pop()?.dispose();
            }
            catch { }
        }
        this.panel.dispose();
    }
    getHtml(webview, _extUri, backendUrl) {
        const nonce = makeNonce();
        // Note: VS Code requires a valid nonce string in both CSP and the <script> tag.
        // Also allow connect-src http/https for backend calls.
        return /* html */ `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
        content="
          default-src 'none';
          img-src ${webview.cspSource} https: data:;
          style-src 'unsafe-inline' ${webview.cspSource};
          script-src 'nonce-${nonce}';
          connect-src http: https:;
        " />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AIDA Chat</title>
  <style>
    :root { --bg:#0b0f14; --panel:#121821; --muted:#94a3b8; --line:#1f2937; }
    * { box-sizing: border-box; }
    html, body { height:100%; background:var(--bg); color:#e5e7eb; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; overflow:hidden; }
    .wrap { display:flex; flex-direction:column; height:100vh; }
    .top { padding:10px 14px; border-bottom:1px solid var(--line); background:var(--panel); }
    .muted { color:var(--muted); font-size:12px; }
    .log { flex:1; overflow:auto; padding:14px; }
    .bubble { max-width:80%; padding:10px 12px; border-radius:14px; margin:8px 0; line-height:1.5; white-space:pre-wrap; word-break:break-word; }
    .you { background:#0f172a; border:1px solid #334155; align-self:flex-end; }
    .bot { background:#0a1f16; border:1px solid #1e3a34; }
    .row { display:flex; gap:10px; padding:12px; border-top:1px solid var(--line); background:var(--panel); }
    input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid #334155; background:#0b1220; color:inherit; outline:none; }
    button { padding:10px 14px; border-radius:10px; border:1px solid #334155; background:#0b1220; color:inherit; cursor:pointer; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .status { padding:8px 12px; border-top:1px solid var(--line); background:#0b1220; font-size:12px; color:#94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top"><div class="muted">Backend: ${backendUrl}</div></div>

    <div id="log" class="log"></div>

    <div class="row">
      <input id="msg" placeholder="Type a message…" autocomplete="off" />
      <button id="send" type="button">Send</button>
      <button id="ping" type="button">Ping</button>
    </div>

    <div id="status" class="status"></div>
  </div>

  <script nonce="${nonce}">
    const backendUrl = ${JSON.stringify(backendUrl)};
    const $ = s => document.querySelector(s);
    const setStatus = t => { const el = $('#status'); if (el) el.textContent = t; };
    const push = (text, who) => {
      const log = $('#log'); const d = document.createElement('div');
      d.className = 'bubble ' + (who==='you'?'you':'bot');
      d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight;
    };

    window.addEventListener('DOMContentLoaded', () => {
      const msg = $('#msg'), sendBtn = $('#send'), pingBtn = $('#ping');

      setStatus('ready; backend=' + backendUrl);

      async function send() {
        const text = (msg.value || '').trim();
        if (!text) { setStatus('empty'); return; }
        push(text, 'you'); msg.value = ''; msg.focus(); sendBtn.disabled = true;
        try {
          const res = await fetch(backendUrl + '/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          });
          setStatus('POST /chat → ' + res.status);
          if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()));
          const data = await res.json();
          push(typeof data.reply === 'string' ? data.reply : JSON.stringify(data), 'bot');
        } catch (e) {
          push('Error: ' + (e?.message || e), 'bot');
          setStatus('error: ' + (e?.message || e));
        } finally {
          sendBtn.disabled = false;
        }
      }

      async function ping() {
        try {
          const res = await fetch(backendUrl + '/');
          setStatus('GET / → ' + res.status);
          push('Ping ' + res.status, 'bot');
        } catch (e) {
          setStatus('ping error: ' + (e?.message || e));
          push('Ping error: ' + (e?.message || e), 'bot');
        }
      }

      sendBtn.addEventListener('click', () => { setStatus('click send'); send(); });
      msg.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); setStatus('enter send'); send(); }});
      pingBtn.addEventListener('click', () => { setStatus('click ping'); ping(); });
      msg.focus();
    });
  </script>
</body>
</html>`;
    }
}
exports.ChatPanel = ChatPanel;
//# sourceMappingURL=ChatPanel.js.map