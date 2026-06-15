/**
 * WXS (WeiXin Script) Compiler
 *
 * WXS scripts run directly in the render layer (WebView), bypassing the logic layer (QuickJS).
 * This eliminates Bridge communication overhead for:
 *   - Event handling
 *   - Data formatting
 *   - Animation calculations
 *
 * Restrictions:
 *   - Cannot call wx.* APIs
 *   - Cannot use eval / new Function
 *   - Cannot access logic layer variables via closure
 *   - Cannot use Promise / async
 *
 * Usage in Vue SFC:
 * ```vue
 * <wxs module="utils">
 *   function formatPrice(price) {
 *     return '¥' + price.toFixed(2);
 *   }
 *   module.exports = { formatPrice: formatPrice };
 * </wxs>
 *
 * <text>{{ utils.formatPrice(item.price) }}</text>
 * ```
 */

export interface WxsModule {
  /** Module name (e.g., "utils") */
  moduleName: string;
  /** WXS source code */
  source: string;
}

/**
 * Parse WXS blocks from SFC template
 *
 * @param template Template string
 * @returns Array of WXS modules
 */
export function parseWxsModules(template: string): WxsModule[] {
  const modules: WxsModule[] = [];
  const wxsRegex = /<wxs\s+module="(\w+)"[^>]*>([\s\S]*?)<\/wxs>/g;

  let match;
  while ((match = wxsRegex.exec(template)) !== null) {
    modules.push({
      moduleName: match[1],
      source: match[2].trim(),
    });
  }

  return modules;
}

/**
 * Compile WXS module to injectable JavaScript
 *
 * @param module WXS module
 * @returns JavaScript code that registers the module in window.__dualler_wxs__
 */
export function compileWxsModule(module: WxsModule): string {
  const { moduleName, source } = module;

  return `
(function() {
  var module = { exports: {} };
  var exports = module.exports;
  (function(module, exports) {
    ${source}
  })(module, exports);
  window.__dualler_wxs__ = window.__dualler_wxs__ || {};
  window.__dualler_wxs__['${moduleName}'] = module.exports;
})();
`;
}

/**
 * Compile all WXS modules in a template
 *
 * @param template Template string
 * @returns JavaScript code to inject into WebView
 */
export function compileAllWxs(template: string): string {
  const modules = parseWxsModules(template);

  if (modules.length === 0) return '';

  return modules.map(compileWxsModule).join('\n');
}

/**
 * Replace WXS template expressions with runtime lookups
 *
 * Transforms: {{ utils.formatPrice(item.price) }}
 * To: {{ __dualler_wxs__['utils'].formatPrice(item.price) }}
 *
 * @param template Template string
 * @returns Template with WXS expressions replaced
 */
export function transformWxsExpressions(template: string): string {
  const modules = parseWxsModules(template);
  const moduleNames = new Set(modules.map(m => m.moduleName));

  if (moduleNames.size === 0) return template;

  // Replace WXS module references in template expressions
  return template.replace(/\{\{\s*(\w+)\.(\w+)\(/g, (match, moduleName, funcName) => {
    if (moduleNames.has(moduleName)) {
      return `{{ __dualler_wxs__['${moduleName}'].${funcName}(`;
    }
    return match;
  });
}
