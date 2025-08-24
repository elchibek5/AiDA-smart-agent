import type { Webview } from 'vscode';

export function withCspAndNonce(html: string, webview: Webview, nonce: string) {
  return html
    .replace(/\{\{csp\}\}/g, webview.cspSource)
    .replace(/\{\{nonce\}\}/g, nonce);
}
