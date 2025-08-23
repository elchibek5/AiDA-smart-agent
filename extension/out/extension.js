"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    const disposable = vscode.commands.registerCommand('aida.chat.open', () => {
        AidaPanel.createOrShow(context);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
class AidaPanel {
    ctx;
    static current;
    panel;
    constructor(panel, ctx) {
        this.ctx = ctx;
        this.panel = panel;
        this.render();
        this.panel.onDidDispose(() => (AidaPanel.current = undefined));
    }
    static createOrShow(ctx) {
        if (AidaPanel.current) {
            AidaPanel.current.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }
        const panel = vscode.window.createWebviewPanel('aidaChat', 'AIDA – Dev Assistant', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, { enableScripts: true, retainContextWhenHidden: true });
        AidaPanel.current = new AidaPanel(panel, ctx);
    }
    render() {
        const cfg = vscode.workspace.getConfiguration('aida');
        const backendUrl = cfg.get('backendUrl') ?? 'http://localhost:3001';
        this.panel.webview.html = this.getHtml(backendUrl);
    }
    getHtml(backend) {
        const esc = (s) => s.replace(/"/g, '&quot;');
        const BACKEND = esc(backend);
        return /* html */ `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src ${BACKEND}; img-src https: data:; font-src data:;" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AIDA – Dev Assistant</title>
<style>
  :root { --bg:#0e0e10; --card:#1e1e24; --text:#f4f4f5; --muted:#a1a1aa; --accent:#8ab4f8; }
  html,body{height:100%} body{margin:0;background:var(--bg);color:var(--text);font:14px/1.4 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial}
  .wrap{height:100%;display:flex;flex-direction:column}
  header{padding:10px 14px;border-bottom:1px solid #2a2a32;background:var(--card)}
  header .url{color:var(--muted);font-size:12px}
  main{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
  .bubble{background:#2a2a33;border-radius:12px;padding:10px 12px;max-width:80%}
  .user{align-self:flex-end;background:#3a3a44}
  .assistant{align-self:flex-start}
  footer{border-top:1px solid #2a2a32;background:var(--card);padding:10px;display:flex;gap:8px}
  textarea{flex:1;resize:vertical;min-height:44px;max-height:140px;background:#131318;color:var(--text);border:1px solid #2a2a32;border-radius:8px;padding:8px}
  button{background:var(--accent);color:#0a0a0d;border:0;border-radius:8px;padding:10px 14px;cursor:pointer}
  .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
  .small{font-size:12px}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div><strong>AIDA – Dev Assistant</strong></div>
      <div class="url">Backend: <code id="backendUrl" class="mono small"></code></div>
    </header>
    <main id="chat"></main>
    <footer>
      <textarea id="prompt" placeholder="Ask AIDA… (Shift+Enter for newline, Enter to send)"></textarea>
      <button id="send">Send</button>
    </footer>
  </div>

  <script>
    const BACKEND = "${BACKEND}";
    document.getElementById('backendUrl').textContent = BACKEND;
    const chat = document.getElementById('chat');
    const promptEl = document.getElementById('prompt');
    const sendBtn = document.getElementById('send');

    function addBubble(text, who) {
      const div = document.createElement('div');
      div.className = 'bubble ' + who;
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
      return div;
    }

    function parseSseLines(buffer) {
      const chunks = buffer.split("\\n\\n");
      return chunks.map(c => c.trim()).filter(Boolean);
    }

    async function askStream(prompt) {
      addBubble(prompt, 'user');
      const assistantBubble = addBubble('', 'assistant');

      try {
        const r = await fetch(BACKEND + '/ask/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (!r.ok || !r.body) {
          assistantBubble.textContent = '[Error] ' + r.status + ' ' + r.statusText;
          return;
        }

        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = parseSseLines(buf);
          if (!buf.endsWith("\\n\\n")) {
            const lastSep = buf.lastIndexOf("\\n\\n");
            if (lastSep >= 0) buf = buf.slice(lastSep + 2);
          } else {
            buf = '';
          }

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const payload = JSON.parse(line.slice(5));
                if (payload && payload.text) {
                  assistantBubble.textContent += payload.text;
                  chat.scrollTop = chat.scrollHeight;
                }
              } catch {}
            } else if (line.startsWith('event:done')) {
              // finished
            }
          }
        }
      } catch (e) {
        assistantBubble.textContent = '[Network error] ' + e.message;
      }
    }

    sendBtn.addEventListener('click', () => {
      const text = promptEl.value.trim();
      if (text) {
        promptEl.value = '';
        askStream(text);
      }
    });

    promptEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  </script>
</body>
</html>`;
    }
}
//# sourceMappingURL=extension.js.map