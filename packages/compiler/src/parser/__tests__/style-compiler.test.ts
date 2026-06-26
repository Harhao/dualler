import { describe, it, expect } from 'vitest';
import { compileStyle } from '../style-compiler';

describe('style-compiler', () => {
  describe('compileStyle', () => {
    it('should convert rpx to vw', async () => {
      const css = `.container { padding: 20rpx; margin: 10rpx 30rpx; }`;

      const result = await compileStyle(css, { scoped: false });

      expect(result).toContain('2.6667vw');  // 20/750*100
      expect(result).toContain('1.3333vw');  // 10/750*100
      expect(result).toContain('4.0000vw');  // 30/750*100
      expect(result).not.toContain('rpx');
    });

    it('should handle decimal rpx values', async () => {
      const css = `.box { width: 375.5rpx; }`;

      const result = await compileStyle(css, { scoped: false });

      expect(result).toContain('50.0667vw');  // 375.5/750*100
    });

    it('should add scoped attribute selectors', async () => {
      const css = `.container { color: red; } .title { font-size: 16px; }`;

      const result = await compileStyle(css, { scoped: true, id: 'abc123' });

      expect(result).toContain('.container[data-v-abc123]');
      expect(result).toContain('.title[data-v-abc123]');
    });

    it('should handle multiple selectors', async () => {
      const css = `.a, .b { color: red; }`;

      const result = await compileStyle(css, { scoped: true, id: 'test' });

      expect(result).toContain('.a[data-v-test]');
      expect(result).toContain('.b[data-v-test]');
    });

    it('should handle pseudo-elements correctly', async () => {
      const css = `.container::before { content: ''; }`;

      const result = await compileStyle(css, { scoped: true, id: 'test' });

      // Scope should be added before the pseudo-element
      expect(result).toContain('.container[data-v-test]::before');
      expect(result).not.toContain('::before[data-v-test]');
    });

    it('should handle :global() selector', async () => {
      const css = `:global(.ant-btn) { color: blue; }`;

      const result = await compileStyle(css, { scoped: true, id: 'test' });

      expect(result).toContain('.ant-btn');
      expect(result).not.toContain('[data-v-test]');
    });

    it('should not double-scope already scoped selectors', async () => {
      const css = `.container[data-v-test] { color: red; }`;

      const result = await compileStyle(css, { scoped: true, id: 'test' });

      // Should not have double [data-v-test]
      expect(result).not.toContain('[data-v-test][data-v-test]');
    });

    it('should handle non-scoped styles', async () => {
      const css = `.global { color: red; }`;

      const result = await compileStyle(css, { scoped: false });

      expect(result).toContain('.global');
      expect(result).not.toContain('[data-v-');
    });

    it('should preserve CSS custom properties', async () => {
      const css = `:root { --primary-color: #1a73e8; } .btn { color: var(--primary-color); }`;

      const result = await compileStyle(css, { scoped: false });

      expect(result).toContain('--primary-color');
      expect(result).toContain('var(--primary-color)');
    });

    it('should handle complex selectors', async () => {
      const css = `.parent > .child { color: red; } .sibling + .next { color: blue; }`;

      const result = await compileStyle(css, { scoped: true, id: 'test' });

      // Vue scoped CSS adds scope to the last selector in the chain
      expect(result).toContain('.parent > .child[data-v-test]');
      expect(result).toContain('.sibling + .next[data-v-test]');
    });

    it('should handle custom design width', async () => {
      const css = `.box { width: 100rpx; }`;

      const result = await compileStyle(css, { scoped: false, designWidth: 375 });

      expect(result).toContain('26.6667vw');  // 100/375*100
    });
  });
});
