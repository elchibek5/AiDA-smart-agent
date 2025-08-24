"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCspAndNonce = withCspAndNonce;
function withCspAndNonce(html, webview, nonce) {
    return html
        .replace(/\{\{csp\}\}/g, webview.cspSource)
        .replace(/\{\{nonce\}\}/g, nonce);
}
//# sourceMappingURL=panelHtml.js.map