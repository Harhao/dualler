import { describe, it, expect } from 'vitest';
import { convertDirectives } from '../directives';

describe('directives', () => {
  describe('convertDirectives', () => {
    it('should convert wx:if to v-if', () => {
      const template = `<view wx:if="{{show}}">Visible</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-if="{{show}}"');
      expect(result).not.toContain('wx:if');
    });

    it('should convert wx:elif to v-else-if', () => {
      const template = `<view wx:elif="{{other}}">Other</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-else-if="{{other}}"');
    });

    it('should convert wx:else to v-else', () => {
      const template = `<view wx:else>Else</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-else');
      expect(result).not.toContain('wx:else');
    });

    it('should convert wx:show to v-show', () => {
      const template = `<view wx:show="{{visible}}">Show</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-show="{{visible}}"');
    });

    it('should convert wx:hidden to v-show with negation', () => {
      const template = `<view wx:hidden="{{hidden}}">Hidden</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-show="!({{hidden}})"');
    });

    it('should convert wx:model to v-model', () => {
      const template = `<input wx:model="{{value}}" />`;
      const result = convertDirectives(template);

      expect(result).toContain('v-model="{{value}}"');
    });

    it('should convert wx:for to v-for', () => {
      const template = `<view wx:for="{{list}}">{{item.name}}</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-for="(item, index) in');
      expect(result).not.toContain('wx:for=');
    });

    it('should handle wx:for-item and wx:for-index', () => {
      const template = `<view wx:for="{{list}}" wx:for-item="myItem" wx:for-index="i">{{myItem.name}}</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-for="(myItem, i) in');
      expect(result).not.toContain('wx:for-item');
      expect(result).not.toContain('wx:for-index');
    });

    it('should convert wx:key to :key', () => {
      const template = `<view wx:for="{{list}}" wx:key="id">{{item.name}}</view>`;
      const result = convertDirectives(template);

      expect(result).toContain(':key="id"');
      expect(result).not.toContain('wx:key');
    });

    it('should handle combined directives', () => {
      const template = `
<view wx:for="{{list}}" wx:key="id" wx:for-item="item">
  <text wx:if="{{item.show}}">{{item.name}}</text>
</view>
`;

      const result = convertDirectives(template);

      expect(result).toContain('v-for=');
      expect(result).toContain(':key="id"');
      expect(result).toContain('v-if=');
    });

    it('should handle wx:for with {{ }} expression', () => {
      const template = `<view wx:for="{{items}}">{{item}}</view>`;
      const result = convertDirectives(template);

      expect(result).toContain('v-for="(item, index) in items"');
    });
  });
});
