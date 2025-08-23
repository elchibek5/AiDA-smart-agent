import * as vscode from 'vscode';

export class ChatPanel {
  public static current: ChatPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extUri: vscode.Uri) {
    this.panel = panel;

    const cfg = vscode.workspace.getConfiguration('aida');
    const backendUrl = cfg.get<string>('backendUrl') || 'http://localhost:3001';

    this.panel.webview.options = { enableScripts: true };
    this.panel.title = 'AIDA Chat';
    this.panel.webview.html = this.getHtml(this.panel.webview, extUri, backendUrl);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  public static show(context: vscode.ExtensionContext) {
    const column = vscode.ViewColumn.Beside;
    if (ChatPanel.current) { ChatPanel.current.panel.reveal(column); return; }
    const panel = vscode.window.createWebviewPanel('aidaChat','AIDA Chat',column,{ enableScripts: true });
    ChatPanel.current = new ChatPanel(panel, context.extensionUri);
  }

  public dispose() {
    ChatPanel.current = undefined;
    while (this.disposables.length) { try { this.disposables.pop()?.dispose(); } catch {} }
    this.panel.dispose();
  }

  private getHtml(webview: vscode.Webview, _extUri: vscode.Uri, backendUrl: string) {
    const nonce = `${Date.now()}-${Math.random()}`;
    return /* html */ `<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
           img-src ${webview.cspSource} https:;
           style-src 'unsafe-inline' ${webview.cspSource};
           script-src 'nonce-${nonce}';
           connect-src http: https:;" />
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
