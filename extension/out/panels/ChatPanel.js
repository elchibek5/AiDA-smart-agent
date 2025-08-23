"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanel = void 0;
const vscode = require("vscode");
class ChatPanel {
    static current;
    panel;
    disposables = [];
    constructor(panel, extUri) {
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
        const nonce = `${Date.now()}-${Math.random()}`;
        return `<!doctype html>
<html><head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; img-src ${webview.cspSource} https:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src http: https:;" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AIDA Chat</title>
<style>
 body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin:0; padding:12px;}
 .row{display:flex; gap:8px; margin-top:12px;}
 input{flex:1; padding:8px;} button{padding:8px 12px; cursor:pointer;}
 .log{margin-top:12px; border:1px solid #3333; padding:10px; border-radius:8px; height:260px; overflow:auto; white-space:pre-wrap;}
 .msg{margin:6px 0;} .user{color:#2563eb;} .bot{color:#16a34a;} .error{color:#dc2626;} .muted{opacity:.8; font-size:12px;}
</style>
</head>
<body>
  <div class="muted">Backend: ${backendUrl}/chat</div>
  <div class="row">
    <input id="msg" placeholder="Type a message…" />
    <button id="send">Send</button>
  </div>
  <div id="log" class="log"></div>
  <script nonce="${nonce}">
    const backendUrl = ${JSON.stringify(backendUrl)};
    const $ = s => document.querySelector(s);
    const log = html => { const d=document.createElement('div'); d.className='msg'; d.innerHTML=html; $('#log').appendChild(d); $('#log').scrollTop = $('#log').scrollHeight; };
    const btn = $('#send'), msg = $('#msg');
    async function send(){
      const text=(msg.value||'').trim(); if(!text) return;
      log('<span class="user">You:</span> '+text); msg.value=''; msg.focus(); btn.disabled=true;
      try{
        const res = await fetch(backendUrl + '/chat', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ message: text })
        });
        if(!res.ok){ throw new Error('HTTP '+res.status+': '+await res.text()); }
        const data = await res.json();
        log('<span class="bot">AIDA:</span> ' + (data.reply ?? JSON.stringify(data)));
      }catch(e){ log('<span class="error">Error:</span> '+(e?.message||e)); }
      finally{ btn.disabled=false; }
    }
    btn.addEventListener('click', send);
    msg.addEventListener('keydown', e => { if(e.key==='Enter') send(); });
    msg.focus();
  </script>
</body></html>`;
    }
}
exports.ChatPanel = ChatPanel;
//# sourceMappingURL=ChatPanel.js.map