import * as vscode from 'vscode';
import { ChatPanel } from './panels/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand('aida.openChat', () => ChatPanel.show(context));
  context.subscriptions.push(cmd);
}
export function deactivate() {}
