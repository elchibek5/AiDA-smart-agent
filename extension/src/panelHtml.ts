import type { Webview } from 'vscode';
export function withCsp(html: string, webview: Webview) {
  return html.replace(/\{\{csp\}\}/g, webview.cspSource);
}
