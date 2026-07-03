export { generateVNodeRender } from './render';
export { generatePageRegistration } from './lifecycle';
export { generateEventBindings } from './events';

/**
 * Assemble the full bundle.js output: CSS injection + render function + Page() registration.
 */
export function generateBundle(
  renderFn: string,
  css: string,
): string {
  const parts: string[] = [];

  // Header
  parts.push('/* dualler-bundle-v1 */');

  // CSS injection
  if (css) {
    parts.push(`(function() {
  var style = document.createElement('style');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();`);
  }

  // Render function
  parts.push(renderFn);

  // Page registration
  parts.push(`
(function() {
  var __DUALLER__ = window.__DUALLER__ || {};
  var Page = __DUALLER__.Page;
  var initPageLifecycle = __DUALLER__.initPageLifecycle;

  if (initPageLifecycle) initPageLifecycle();

  Page({
    data: {},
    render: render,
    onLoad: function() {},
    onUnload: function() {},
    onShow: function() {},
    onHide: function() {},
  });
})();`);

  return parts.join('\n');
}
