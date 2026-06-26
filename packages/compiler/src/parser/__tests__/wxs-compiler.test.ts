import { describe, it, expect } from 'vitest';
import { parseWxsModules, compileWxsModule, compileAllWxs, transformWxsExpressions } from '../wxs-compiler';

describe('wxs-compiler', () => {
  describe('parseWxsModules', () => {
    it('should parse single WXS module', () => {
      const template = `
<wxs module="utils">
function formatPrice(price) {
  return '¥' + price.toFixed(2);
}
module.exports = { formatPrice: formatPrice };
</wxs>
<text>{{ utils.formatPrice(item.price) }}</text>
`;

      const modules = parseWxsModules(template);

      expect(modules).toHaveLength(1);
      expect(modules[0].moduleName).toBe('utils');
      expect(modules[0].source).toContain('formatPrice');
    });

    it('should parse multiple WXS modules', () => {
      const template = `
<wxs module="utils">var x = 1;</wxs>
<wxs module="helpers">var y = 2;</wxs>
`;

      const modules = parseWxsModules(template);

      expect(modules).toHaveLength(2);
      expect(modules[0].moduleName).toBe('utils');
      expect(modules[1].moduleName).toBe('helpers');
    });

    it('should return empty array for no WXS', () => {
      const template = `<text>No WXS here</text>`;

      const modules = parseWxsModules(template);

      expect(modules).toHaveLength(0);
    });
  });

  describe('compileWxsModule', () => {
    it('should compile WXS to IIFE', () => {
      const module = {
        moduleName: 'utils',
        source: 'function add(a, b) { return a + b; }\nmodule.exports = { add: add };',
      };

      const result = compileWxsModule(module);

      expect(result).toContain('(function()');
      expect(result).toContain('window.__dualler_wxs__');
      expect(result).toContain("window.__dualler_wxs__['utils']");
      expect(result).toContain('module.exports');
    });
  });

  describe('compileAllWxs', () => {
    it('should compile all WXS in template', () => {
      const template = `
<wxs module="utils">var x = 1;</wxs>
<text>{{ utils.x }}</text>
`;

      const result = compileAllWxs(template);

      expect(result).toContain('window.__dualler_wxs__');
    });

    it('should return empty string for no WXS', () => {
      const template = `<text>No WXS</text>`;

      const result = compileAllWxs(template);

      expect(result).toBe('');
    });
  });

  describe('transformWxsExpressions', () => {
    it('should transform WXS references in template', () => {
      const template = `
<wxs module="utils">function format(p) { return p; }</wxs>
<text>{{ utils.format(item.price) }}</text>
`;

      const result = transformWxsExpressions(template);

      expect(result).toContain("__dualler_wxs__['utils'].format(");
    });

    it('should not transform non-WXS references', () => {
      const template = `<text>{{ item.name }}</text>`;

      const result = transformWxsExpressions(template);

      expect(result).toContain('{{ item.name }}');
      expect(result).not.toContain('__dualler_wxs__');
    });
  });
});
