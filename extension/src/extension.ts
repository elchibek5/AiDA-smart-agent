import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { withCsp } from './panelHtml';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('aida.openChat', () => {
    const panel = vscode.window.createWebviewPanel(
      'aidaPanel',
      'AIDA Chat',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    const htmlPath = path.join(context.extensionPath, 'media', 'index.html');
    const raw = fs.readFileSync(htmlPath, 'utf8');
    panel.webview.html = withCsp(raw, panel.webview);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
