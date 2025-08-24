"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = getNonce;
function getNonce(length = 32) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=nonce.js.map