/**
 * Generate Page() registration code for a compiled page.
 *
 * The bundle.js output is a self-contained IIFE that:
 * 1. Initializes the dualler runtime
 * 2. Defines the render function
 * 3. Registers the page via Page()
 */
export function generatePageRegistration(
  filename: string,
  renderFn: string,
  logic: string,
): string {
  return `
(function() {
  /* Runtime shim — injected by host environment */
  var __DUALLER__ = window.__DUALLER__ || {};
  var Page = __DUALLER__.Page;
  var createReactiveData = __DUALLER__.createReactiveData;
  var initPageLifecycle = __DUALLER__.initPageLifecycle;

  /* Initialize lifecycle */
  if (initPageLifecycle) initPageLifecycle();

  /* Render function */
  ${renderFn}

  /* Page registration */
  Page({
    data: {},
    render: render,
    onLoad: function() {},
    onUnload: function() {},
    onShow: function() {},
    onHide: function() {},
  });
})();
`;
}
