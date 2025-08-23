"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const ChatPanel_1 = require("./panels/ChatPanel");
function activate(context) {
    const cmd = vscode.commands.registerCommand('aida.openChat', () => ChatPanel_1.ChatPanel.show(context));
    context.subscriptions.push(cmd);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map