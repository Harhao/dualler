import { describe, it, expect } from 'vitest';
import { compileTemplate } from '../template-compiler';

describe('template-compiler', () => {
  describe('compileTemplate', () => {
    it('should compile basic template with tag mapping', () => {
      const template = `
<view class="container">
  <text>Hello</text>
  <image src="test.png" />
</view>
`;

      const result = compileTemplate(template);

      expect(result.code).toContain('<div');
      expect(result.code).toContain('<span');
      expect(result.code).toContain('<img');
      expect(result.code).not.toContain('<view');
      expect(result.code).not.toContain('<text');
      expect(result.code).not.toContain('<image');
    });

    it('should convert @tap to @click', () => {
      const template = `<button @tap="handleClick">Click me</button>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('@click="handleClick"');
      expect(result.code).not.toContain('@tap');
    });

    it('should convert bind:tap to @click', () => {
      const template = `<button bind:tap="handleClick">Click me</button>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('@click="handleClick"');
    });

    it('should convert catch:tap to @click.stop', () => {
      const template = `<button catch:tap="handleClick">Click me</button>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('@click.stop="handleClick"');
    });

    it('should convert wx:if to v-if', () => {
      const template = `<view wx:if="{{show}}">Visible</view>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('v-if');
      expect(result.code).not.toContain('wx:if');
    });

    it('should convert wx:for to v-for', () => {
      const template = `<view wx:for="{{list}}" wx:key="id">{{item.name}}</view>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('v-for');
      expect(result.code).not.toContain('wx:for');
    });

    it('should preserve Vue directives', () => {
      const template = `
<div>
  <div v-if="show">Conditional</div>
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>
  <input v-model="value" />
</div>
`;

      const result = compileTemplate(template);

      expect(result.code).toContain('v-if="show"');
      expect(result.code).toContain('v-for="item in list"');
      expect(result.code).toContain(':key="item.id"');
      expect(result.code).toContain('v-model="value"');
    });

    it('should collect reactive dependencies', () => {
      const template = `
<div>
  <span>{{ count }}</span>
  <span>{{ name }}</span>
  <button @click="increment">+1</button>
</div>
`;

      const result = compileTemplate(template);

      expect(result.deps).toContain('count');
      expect(result.deps).toContain('name');
      expect(result.deps).toContain('increment');
    });

    it('should not collect built-in identifiers', () => {
      const template = `
<div>
  <span>{{ true }}</span>
  <span>{{ Math.PI }}</span>
  <span>{{ count }}</span>
</div>
`;

      const result = compileTemplate(template);

      expect(result.deps).not.toContain('true');
      expect(result.deps).not.toContain('Math');
      expect(result.deps).toContain('count');
    });

    it('should handle native components', () => {
      const template = `
<div>
  <video src="test.mp4" />
  <map longitude="116" latitude="39" />
</div>
`;

      const result = compileTemplate(template);

      expect(result.nativeComponents).toContain('video');
      expect(result.nativeComponents).toContain('map');
      expect(result.code).toContain('data-native');
    });

    it('should handle custom components', () => {
      const template = `
<div>
  <my-button label="Click" />
  <my-card>Content</my-card>
</div>
`;

      const result = compileTemplate(template);

      expect(result.customComponentTags).toContain('my-button');
      expect(result.customComponentTags).toContain('my-card');
    });

    it('should handle scroll-view mapping', () => {
      const template = `<scroll-view scroll-y>Content</scroll-view>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('<div');
      expect(result.code).toContain('scroll-y');
    });

    it('should handle navigator mapping', () => {
      const template = `<navigator url="/pages/index/index">Go</navigator>`;

      const result = compileTemplate(template);

      expect(result.code).toContain('<a');
    });
  });
});
