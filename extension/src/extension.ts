import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { withCspAndNonce } from './panelHtml';
import { getNonce } from './nonce';

export function activate(context: vscode.ExtensionContext) {
  const open = vscode.commands.registerCommand('aida.openChat', () => {
    const panel = vscode.window.createWebviewPanel(
      'aidaPanel',
      'AIDA Chat',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
      }
    );

    const htmlPath = path.join(context.extensionPath, 'media', 'index.html');
    const raw = fs.readFileSync(htmlPath, 'utf8');
    const nonce = getNonce();
    panel.webview.html = withCspAndNonce(raw, panel.webview, nonce);
  });

  context.subscriptions.push(open);
}

export function deactivate() {}
