import { describe, it, expect } from 'vitest';
import { parseSFC, getScriptBlock, isDuallerComponent } from '../sfc-parser';

describe('sfc-parser', () => {
  describe('parseSFC', () => {
    it('should parse a basic SFC with template, script, and style', () => {
      const source = `
<template>
  <view class="container">
    <text>{{ message }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello')
</script>

<style scoped>
.container { padding: 20rpx; }
</style>
`;

      const result = parseSFC(source, 'test.vue');

      expect(result.descriptor.template).toBeTruthy();
      expect(result.descriptor.scriptSetup).toBeTruthy();
      expect(result.descriptor.styles).toHaveLength(1);
      expect(result.hasScriptSetup).toBe(true);
      expect(result.componentName).toBe('Test');
      expect(result.langInfo.scriptLang).toBe('js');
      expect(result.langInfo.styleScoped).toBe(true);
    });

    it('should parse SFC with regular script (not setup)', () => {
      const source = `
<template>
  <div>{{ msg }}</div>
</template>

<script>
export default {
  data() {
    return { msg: 'Hello' }
  }
}
</script>
`;

      const result = parseSFC(source, 'test.vue');

      expect(result.descriptor.script).toBeTruthy();
      expect(result.descriptor.scriptSetup).toBeNull();
      expect(result.hasScriptSetup).toBe(false);
    });

    it('should parse SFC with multiple style blocks', () => {
      const source = `
<template><div/></template>

<style>
.global { color: red; }
</style>

<style scoped>
.local { color: blue; }
</style>
`;

      const result = parseSFC(source, 'test.vue');

      expect(result.descriptor.styles).toHaveLength(2);
      expect(result.descriptor.styles[0].scoped).toBeFalsy();
      expect(result.descriptor.styles[1].scoped).toBe(true);
    });

    it('should parse SFC with TypeScript', () => {
      const source = `
<template><div>{{ count }}</div></template>

<script setup lang="ts">
const count: number = 0
</script>
`;

      const result = parseSFC(source, 'test.vue');

      expect(result.langInfo.scriptLang).toBe('ts');
    });

    it('should derive component name from filename', () => {
      expect(parseSFC('<template><div/></template>', 'MyButton.vue').componentName).toBe('MyButton');
      expect(parseSFC('<template><div/></template>', 'my-button.vue').componentName).toBe('MyButton');
      expect(parseSFC('<template><div/></template>', 'pages/index/index.vue').componentName).toBe('Index');
    });

    it('should throw on invalid SFC', () => {
      expect(() => parseSFC('<template><div></template>', 'test.vue')).toThrow();
    });
  });

  describe('getScriptBlock', () => {
    it('should prefer script setup over regular script', () => {
      const source = `
<script>export default {}</script>
<script setup>const x = 1</script>
`;

      const { descriptor } = parseSFC(source, 'test.vue');
      const block = getScriptBlock(descriptor);

      expect(block).toBeTruthy();
      expect(block!.content).toContain('const x = 1');
    });

    it('should return regular script if no setup', () => {
      const source = `
<script>export default {}</script>
`;

      const { descriptor } = parseSFC(source, 'test.vue');
      const block = getScriptBlock(descriptor);

      expect(block).toBeTruthy();
      expect(block!.content).toContain('export default');
    });

    it('should return null if no script', () => {
      const source = `<template><div/></template>`;

      const { descriptor } = parseSFC(source, 'test.vue');
      const block = getScriptBlock(descriptor);

      expect(block).toBeNull();
    });
  });

  describe('isDuallerComponent', () => {
    it('should recognize built-in tags', () => {
      expect(isDuallerComponent('view')).toBe(true);
      expect(isDuallerComponent('text')).toBe(true);
      expect(isDuallerComponent('image')).toBe(true);
      expect(isDuallerComponent('button')).toBe(true);
      expect(isDuallerComponent('input')).toBe(true);
      expect(isDuallerComponent('scroll-view')).toBe(true);
      expect(isDuallerComponent('swiper')).toBe(true);
      expect(isDuallerComponent('navigator')).toBe(true);
      expect(isDuallerComponent('video')).toBe(true);
      expect(isDuallerComponent('map')).toBe(true);
    });

    it('should reject non-built-in tags', () => {
      expect(isDuallerComponent('div')).toBe(false);
      expect(isDuallerComponent('span')).toBe(false);
      expect(isDuallerComponent('my-component')).toBe(false);
    });
  });
});
