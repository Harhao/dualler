/**
 * Mini-program event to DOM event mapping
 *
 * Supports both WeChat-style (bind:tap, catch:tap) and Vue-style (@tap) syntax.
 * The compiled output uses Vue @event syntax for WebView rendering.
 */

export const EVENT_MAP: Record<string, string> = {
  // Touch events
  'tap': 'click',
  'longtap': 'longtap',
  'longpress': 'longpress',
  'touchstart': 'touchstart',
  'touchmove': 'touchmove',
  'touchend': 'touchend',
  'touchcancel': 'touchcancel',

  // Form events
  'input': 'input',
  'change': 'change',
  'submit': 'submit',
  'focus': 'focus',
  'blur': 'blur',
  'confirm': 'confirm',
  'linechange': 'linechange',
  'keyboardheightchange': 'keyboardheightchange',

  // Scroll events
  'scroll': 'scroll',
  'scrolltoupper': 'scrolltoupper',
  'scrolltolower': 'scrolltolower',

  // Other events
  'load': 'load',
  'error': 'error',
  'columnchange': 'columnchange',
};

/**
 * Convert mini-program event name to DOM event name
 */
export function mapEventName(mpEvent: string): string {
  return EVENT_MAP[mpEvent] ?? mpEvent;
}

/**
 * Parse WeChat-style event binding syntax
 *
 * bind:tap → @click
 * catch:tap → @click.stop
 * capture-bind:tap → @click.capture
 * capture-catch:tap → @click.capture.stop
 * mut-bind:tap → @click (mut-bind is WeChat-specific, maps to regular binding)
 *
 * Also handles shorthand: bindtap → @click, catchtap → @click.stop
 */
export function parseEventBinding(attrName: string): { event: string; modifiers: string[] } | null {
  // Pattern: (bind|catch|capture-bind|capture-catch|mut-bind):eventName
  // Or shorthand: (bind|catch)eventName
  const longFormMatch = attrName.match(
    /^(capture-bind|capture-catch|mut-bind|bind|catch)[:](.+)$/
  );
  const shortFormMatch = attrName.match(
    /^(bind|catch)([a-z].+)$/
  );

  const match = longFormMatch ?? shortFormMatch;
  if (!match) return null;

  const directive = match[1];
  const mpEvent = match[2];
  const domEvent = mapEventName(mpEvent);

  const modifiers: string[] = [];
  if (directive.includes('capture')) {
    modifiers.push('capture');
  }
  if (directive.includes('catch')) {
    modifiers.push('stop');
  }

  return { event: domEvent, modifiers };
}

/**
 * Convert WeChat-style event attributes in template string to Vue @event syntax
 *
 * Examples:
 *   bind:tap="handler" → @click="handler"
 *   catch:tap="handler" → @click.stop="handler"
 *   capture-bind:tap="handler" → @click.capture="handler"
 *   bindtap="handler" → @click="handler"
 *   @tap="handler" → @click="handler" (Vue-style tap conversion)
 */
export function convertEventAttributes(template: string): string {
  // Convert long-form: bind:tap, catch:tap, capture-bind:tap, capture-catch:tap, mut-bind:tap
  template = template.replace(
    /\s(capture-bind|capture-catch|mut-bind|bind|catch):([a-zA-Z][\w-]*)="([^"]*?)"/g,
    (_, directive, event, handler) => {
      const mapped = mapEventName(event);
      const modifiers: string[] = [];
      if (directive.includes('catch')) modifiers.push('stop');
      if (directive.includes('capture')) modifiers.push('capture');
      const modStr = modifiers.length ? '.' + modifiers.join('.') : '';
      return ` @${mapped}${modStr}="${handler}"`;
    }
  );

  // Convert short-form: bindtap, catchtap
  template = template.replace(
    /\s(bind|catch)([a-z][\w-]*)="([^"]*?)"/g,
    (_, directive, event, handler) => {
      const mapped = mapEventName(event);
      const modifiers: string[] = [];
      if (directive === 'catch') modifiers.push('stop');
      const modStr = modifiers.length ? '.' + modifiers.join('.') : '';
      return ` @${mapped}${modStr}="${handler}"`;
    }
  );

  // Convert Vue-style @tap to @click (tap is a WeChat concept, click is DOM)
  template = template.replace(
    /@tap(\.([\w.]+))?="([^"]*?)"/g,
    (_, modPart, mods, handler) => {
      const existingMods = mods ? mods.split('.') : [];
      const modStr = existingMods.length ? '.' + existingMods.join('.') : '';
      return `@click${modStr}="${handler}"`;
    }
  );

  return template;
}
