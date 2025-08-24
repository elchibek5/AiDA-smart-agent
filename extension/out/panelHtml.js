"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCsp = withCsp;
function withCsp(html, webview) {
    return html.replace(/\{\{csp\}\}/g, webview.cspSource);
}
//# sourceMappingURL=panelHtml.js.map