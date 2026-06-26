import { describe, it, expect } from 'vitest';
import { mapEventName, parseEventBinding, convertEventAttributes } from '../event-map';

describe('event-map', () => {
  describe('mapEventName', () => {
    it('should map tap to click', () => {
      expect(mapEventName('tap')).toBe('click');
    });

    it('should map longpress to longpress', () => {
      expect(mapEventName('longpress')).toBe('longpress');
    });

    it('should map touchstart to touchstart', () => {
      expect(mapEventName('touchstart')).toBe('touchstart');
    });

    it('should map input to input', () => {
      expect(mapEventName('input')).toBe('input');
    });

    it('should pass through unknown events', () => {
      expect(mapEventName('custom')).toBe('custom');
    });
  });

  describe('parseEventBinding', () => {
    it('should parse bind:tap', () => {
      const result = parseEventBinding('bind:tap');

      expect(result).toEqual({ event: 'click', modifiers: [] });
    });

    it('should parse catch:tap', () => {
      const result = parseEventBinding('catch:tap');

      expect(result).toEqual({ event: 'click', modifiers: ['stop'] });
    });

    it('should parse capture-bind:tap', () => {
      const result = parseEventBinding('capture-bind:tap');

      expect(result).toEqual({ event: 'click', modifiers: ['capture'] });
    });

    it('should parse capture-catch:tap', () => {
      const result = parseEventBinding('capture-catch:tap');

      expect(result).toEqual({ event: 'click', modifiers: ['capture', 'stop'] });
    });

    it('should parse short-form bindtap', () => {
      const result = parseEventBinding('bindtap');

      expect(result).toEqual({ event: 'click', modifiers: [] });
    });

    it('should parse short-form catchtap', () => {
      const result = parseEventBinding('catchtap');

      expect(result).toEqual({ event: 'click', modifiers: ['stop'] });
    });

    it('should return null for non-event attributes', () => {
      expect(parseEventBinding('class')).toBeNull();
      expect(parseEventBinding('id')).toBeNull();
    });
  });

  describe('convertEventAttributes', () => {
    it('should convert bind:tap to @click', () => {
      const template = `<button bind:tap="handler">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click="handler"');
      expect(result).not.toContain('bind:tap');
    });

    it('should convert catch:tap to @click.stop', () => {
      const template = `<button catch:tap="handler">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click.stop="handler"');
    });

    it('should convert short-form bindtap', () => {
      const template = `<button bindtap="handler">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click="handler"');
    });

    it('should convert Vue-style @tap to @click', () => {
      const template = `<button @tap="handler">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click="handler"');
      expect(result).not.toContain('@tap');
    });

    it('should convert @tap.stop to @click.stop', () => {
      const template = `<button @tap.stop="handler">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click.stop="handler"');
    });

    it('should preserve other Vue events', () => {
      const template = `<input @input="handler" @focus="onFocus" />`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@input="handler"');
      expect(result).toContain('@focus="onFocus"');
    });

    it('should handle multiple events', () => {
      const template = `<button bind:tap="handler1" catch:touchstart="handler2">Click</button>`;
      const result = convertEventAttributes(template);

      expect(result).toContain('@click="handler1"');
      expect(result).toContain('@touchstart.stop="handler2"');
    });
  });
});
