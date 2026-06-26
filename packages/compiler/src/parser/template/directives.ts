/**
 * Mini-program template directive conversions
 *
 * WeChat mini-program directives → Vue3 directives
 * Since Dualler uses WebView with Vue runtime, we convert to Vue syntax.
 */

/**
 * Convert WeChat-style template directives to Vue3 equivalents
 *
 * wx:if="expr" → v-if="expr"
 * wx:elif="expr" → v-else-if="expr"
 * wx:else → v-else
 * wx:for="list" → v-for="(item, index) in list"
 * wx:key="id" → :key="id" (handled separately)
 * wx:for-item="item" → custom loop variable name
 * wx:for-index="idx" → custom index variable name
 * wx:show="expr" → v-show="expr"
 * wx:hidden="expr" → v-show="!expr" (inverted)
 * wx:model="expr" → v-model="expr"
 */
export function convertDirectives(template: string): string {
  // wx:if → v-if
  template = template.replace(/\bwx:if="/g, 'v-if="');

  // wx:elif → v-else-if
  template = template.replace(/\bwx:elif="/g, 'v-else-if="');

  // wx:else → v-else (no value)
  template = template.replace(/\bwx:else(?=["\s/>])/g, 'v-else');

  // wx:show → v-show
  template = template.replace(/\bwx:show="/g, 'v-show="');

  // wx:hidden → v-show="!(...)"
  template = template.replace(/\bwx:hidden="([^"]*?)"/g, (_, expr) => {
    return `v-show="!(${expr})"`;
  });

  // wx:model → v-model
  template = template.replace(/\bwx:model="/g, 'v-model="');

  // wx:for handling - this is more complex
  template = convertForLoops(template);

  // wx:key → :key
  template = template.replace(/\bwx:key="/g, ':key="');

  return template;
}

/**
 * Convert wx:for loops to Vue v-for syntax
 *
 * WeChat:
 *   wx:for="{{ list }}" wx:for-item="item" wx:for-index="idx"
 *
 * Vue:
 *   v-for="(item, idx) in list" :key="idx"
 */
function convertForLoops(template: string): string {
  // Match elements with wx:for attribute
  // This regex-based approach handles the common cases
  return template.replace(
    /(<[^>]*?)\bwx:for="([^"]*?)"([^>]*?)>/g,
    (match, before, listExpr, after) => {
      // Extract wx:for-item and wx:for-index from the full tag
      const fullTag = match;
      let itemName = 'item';
      let indexName = 'index';

      const itemMatch = fullTag.match(/wx:for-item="(\w+)"/);
      if (itemMatch) itemName = itemMatch[1];

      const indexMatch = fullTag.match(/wx:for-index="(\w+)"/);
      if (indexMatch) indexName = indexMatch[1];

      // Clean up wx:for-item and wx:for-index from the tag
      let cleanedAfter = after
        .replace(/\s*wx:for-item="[^"]*"/g, '')
        .replace(/\s*wx:for-index="[^"]*"/g, '');

      // Build v-for expression
      // Unwrap {{ }} if present
      const cleanList = listExpr.replace(/\{\{\s*(.*?)\s*\}\}/g, '$1');
      const vforExpr = `v-for="(${itemName}, ${indexName}) in ${cleanList}"`;

      return `${before}${vforExpr}${cleanedAfter}>`;
    }
  );
}

/**
 * Convert {{ }} interpolation syntax
 * WeChat uses {{ expr }}, Vue also uses {{ expr }}
 * So no conversion needed, but we need to handle WXS module references
 */
export function convertInterpolations(template: string): string {
  // {{ }} is the same in both, no conversion needed
  // WXS expressions are handled by wxs-compiler.ts
  return template;
}

/**
 * Handle special WeChat template features
 *
 * - <import src="..."/> → component import
 * - <include src="..."/> → template include
 * - <template is="..." data="{{ ... }}"/> → dynamic component
 */
export function convertSpecialElements(template: string): string {
  // <import> and <include> are WeChat-specific file inclusion mechanisms
  // In Dualler, these map to Vue component imports at the script level
  // Remove them from template (they're handled during bundling)
  template = template.replace(/<import\s+[^>]*\/>/g, '');
  template = template.replace(/<include\s+[^>]*\/>/g, '');

  // <template is="..." data="{{ ... }}"/> → Vue dynamic component
  template = template.replace(
    /<template\s+is="([^"]*?)"\s+data="\{\{(.*?)\}\}"\s*\/>/g,
    (_, name, data) => {
      return `<component :is="${name}" v-bind="${data.trim()}" />`;
    }
  );

  return template;
}
