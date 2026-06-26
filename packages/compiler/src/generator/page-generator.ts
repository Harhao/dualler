/**
 * Page Generator - Generates complete page files for mini-program
 *
 * Generates:
 * - page.html: Template with Vue runtime support
 * - page.js: Script with Dualler runtime integration
 * - page.css: Styles with rpx conversion and scoping
 */

export interface PageGeneratorOptions {
  /** Page name (e.g., "pages/index/index") */
  pageName: string;
  /** Compiled template HTML */
  templateHtml: string;
  /** Compiled script JS */
  scriptJs: string;
  /** Compiled style CSS */
  styleCss: string;
  /** WXS scripts to inject */
  wxsScripts?: string;
  /** Whether to include Vue runtime */
  includeVueRuntime?: boolean;
}

/**
 * Generate complete page HTML
 *
 * The HTML includes:
 * - Meta viewport for mobile
 * - CSS links (app.css + page.css)
 * - Template content in #app div
 * - WXS scripts (if any)
 * - Page script
 * - Optional Vue runtime
 */
export function generatePageHtml(options: PageGeneratorOptions): string {
  const {
    pageName,
    templateHtml,
    wxsScripts,
    includeVueRuntime = true,
  } = options;

  const vueRuntimeScript = includeVueRuntime
    ? '<script src="https://unpkg.com/vue@3/dist/vue.runtime.global.prod.js"></script>'
    : '';

  const wxsBlock = wxsScripts
    ? `<script>${wxsScripts}</script>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="/app.css">
  <link rel="stylesheet" href="/${pageName}.css">
  ${vueRuntimeScript}
</head>
<body>
  <div id="app">
    ${templateHtml}
  </div>
  ${wxsBlock}
  <script src="/${pageName}.js"></script>
</body>
</html>`;
}

/**
 * Generate component HTML template
 *
 * Components use <template> tag for Vue component registration
 */
export function generateComponentHtml(
  componentName: string,
  templateHtml: string,
): string {
  return `<template id="${componentName}">
${templateHtml}
</template>`;
}

/**
 * Generate the render function wrapper for Vue runtime compilation
 *
 * This wraps the template in code that Vue can compile at runtime
 */
export function generateRuntimeCompileWrapper(templateHtml: string): string {
  return `
(function() {
  var app = Vue.createApp({
    template: ${JSON.stringify(templateHtml)},
    setup: function() {
      // Setup will be provided by page.js
    }
  });
  app.mount('#app');
})();
`.trim();
}
