"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundle = bundle;
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const COMPILER_VERSION = '1.0.0';
async function bundle(options) {
    const { appId, entry, pages, components, outputDir, minify = true, sourceMap = false } = options;
    const files = new Map();
    // Create output directory
    (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    // Build app.js
    const appJsContent = `// Dualler App Entry\n// appId: ${appId}\nconsole.log('Dualler app loaded');`;
    const appJsPath = 'app.js';
    (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, appJsPath), appJsContent);
    files.set(appJsPath, createFileInfo(appJsPath, appJsContent));
    // Build pages
    for (const page of pages) {
        const pageName = page.replace(/\.vue$/, '').replace(/^src\//, '');
        const jsContent = `// Page: ${pageName}\n__dualler_page__('${pageName}', { setup() { return {}; } });`;
        const htmlContent = `<!DOCTYPE html><html><body><div id="app"></div></body></html>`;
        const cssContent = `/* Page: ${pageName} */\nbody { margin: 0; }`;
        const jsPath = `${pageName}.js`;
        const htmlPath = `${pageName}.html`;
        const cssPath = `${pageName}.css`;
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, jsPath), jsContent);
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, htmlPath), htmlContent);
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, cssPath), cssContent);
        files.set(jsPath, createFileInfo(jsPath, jsContent));
        files.set(htmlPath, createFileInfo(htmlPath, htmlContent));
        files.set(cssPath, createFileInfo(cssPath, cssContent));
    }
    // Generate manifest
    const manifest = {
        appId,
        version: '1.0.0',
        compilerVersion: COMPILER_VERSION,
        pages: pages.map(p => p.replace(/\.vue$/, '').replace(/^src\//, '')),
        components: components.map(c => c.replace(/\.vue$/, '').replace(/^src\//, '')),
        files: Object.fromEntries(files),
        totalSize: Array.from(files.values()).reduce((sum, f) => sum + f.size, 0),
        buildTime: new Date().toISOString(),
    };
    (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    return { files, manifest };
}
function createFileInfo(path, content) {
    const sha256 = (0, crypto_1.createHash)('sha256').update(content).digest('hex');
    return { path, sha256, size: Buffer.byteLength(content) };
}
//# sourceMappingURL=package-bundler.js.map