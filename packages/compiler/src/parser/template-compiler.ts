import { baseParse, NodeTypes, TemplateChildNode, ElementNode, Node } from '@vue/compiler-dom';
import { convertEventAttributes } from './template/event-map';
import { convertDirectives, convertSpecialElements } from './template/directives';

/**
 * Tag mapping from mini-program built-in tags to HTML equivalents.
 *
 * Kept as a frozen object for immutability and fast lookup.
 */
const TAG_MAP: Readonly<Record<string, string>> = Object.freeze({
  'view': 'div',
  'text': 'span',
  'image': 'img',
  'scroll-view': 'div',
  'swiper': 'div',
  'swiper-item': 'div',
  'navigator': 'a',
  'web-view': 'iframe',
  'icon': 'span',
  'progress': 'div',
  'rich-text': 'div',
  'checkbox-group': 'div',
  'radio-group': 'div',
  'picker-view': 'div',
  'form': 'form',
  'recycle-view': 'div',  // Virtual list container
});

/** Tags that require same-layer native rendering */
const NATIVE_COMPONENTS: ReadonlySet<string> = new Set([
  'video', 'map', 'live-player', 'live-pusher', 'camera', 'canvas',
]);

/** Standard HTML tags that should not be transformed */
const HTML_NATIVE_TAGS: ReadonlySet<string> = new Set([
  'button', 'input', 'textarea', 'checkbox', 'radio', 'picker',
  'slider', 'switch', 'audio', 'label', 'block',
]);

/** All recognized Dualler tags (for quick lookup) */
const ALL_KNOWN_TAGS: ReadonlySet<string> = new Set([
  ...Object.keys(TAG_MAP),
  ...NATIVE_COMPONENTS,
  ...HTML_NATIVE_TAGS,
]);

export interface CompileTemplateOptions {
  /** Known custom component names (from SFC imports) */
  customComponents?: ReadonlySet<string>;
  /** Source file path for error reporting */
  filename?: string;
}

export interface CompileTemplateResult {
  /** Compiled template HTML (pre-processed for Vue runtime) */
  code: string;
  /** Reactive dependencies found in expressions */
  deps: string[];
  /** Native components that need same-layer rendering */
  nativeComponents: string[];
  /** Custom component tags found in template */
  customComponentTags: string[];
}

/**
 * Compile Vue3 template to Dualler-compatible HTML.
 *
 * Since Dualler uses a WebView with Vue runtime, we output a pre-processed
 * template that Vue can compile at runtime.
 *
 * Pipeline:
 * 1. Convert WeChat-style directives (wx:if → v-if, wx:for → v-for)
 * 2. Convert WeChat-style events (bind:tap → @click, catch:tap → @click.stop)
 * 3. Convert special elements (import/include removal, template is → component)
 * 4. Map mini-program tags to HTML (view → div, text → span, etc.)
 * 5. Parse AST to collect reactive dependencies
 */
export function compileTemplate(
  template: string,
  options: CompileTemplateOptions = {},
): CompileTemplateResult {
  const deps: string[] = [];
  const nativeComponents: string[] = [];
  const customComponentTags: string[] = [];
  const { customComponents = new Set() } = options;

  // Steps 1-3: Pre-process WeChat-style syntax to Vue syntax
  let processed = template;
  processed = convertDirectives(processed);
  processed = convertEventAttributes(processed);
  processed = convertSpecialElements(processed);

  // Step 4: Map mini-program tags to HTML tags
  processed = mapElementTags(processed, customComponents, nativeComponents, customComponentTags);

  // Step 5: Parse AST to collect reactive dependencies
  try {
    const ast = baseParse(processed, {
      getNamespace: () => 0,
      isVoidTag: (tag: string) => HTML_VOID_TAGS.has(tag),
      isCustomElement: (tag: string) => {
        return customComponents.has(tag) || (tag.includes('-') && !ALL_KNOWN_TAGS.has(tag));
      },
    });

    walkAst(ast, (node) => collectReactiveDeps(node, deps));
  } catch (err) {
    // Template parsing may fail on edge cases; the Vue runtime in WebView
    // will report the actual error at runtime. Log for debugging.
    console.debug(`[dualler:template] Parse warning for ${options.filename ?? 'unknown'}:`, err);
  }

  return {
    code: processed,
    deps: [...new Set(deps)],
    nativeComponents: [...new Set(nativeComponents)],
    customComponentTags: [...new Set(customComponentTags)],
  };
}

/** HTML void elements that cannot have children */
const HTML_VOID_TAGS: ReadonlySet<string> = new Set([
  'img', 'input', 'br', 'hr', 'meta', 'link', 'source',
  'area', 'base', 'col', 'embed', 'track', 'wbr',
]);

/**
 * Map mini-program element tags to HTML equivalents.
 *
 * Uses a three-pass approach for correctness:
 * 1. Map Dualler built-in tags to HTML
 * 2. Convert native components to div with data-native marker
 * 3. Track remaining custom component tags
 */
function mapElementTags(
  template: string,
  customComponents: ReadonlySet<string>,
  nativeComponents: string[],
  customComponentTags: string[],
): string {
  // Pass 1: Map Dualler built-in tags to HTML
  // Use word boundary to avoid matching partial tags (e.g., "viewer" should not match "view")
  for (const [mpTag, htmlTag] of Object.entries(TAG_MAP)) {
    // Opening tags: <view>, <view class="...">
    template = template.replace(
      new RegExp(`<${mpTag}(\\s|/?>)`, 'gi'),
      `<${htmlTag}$1`,
    );
    // Closing tags: </view>
    template = template.replace(
      new RegExp(`</${mpTag}>`, 'gi'),
      `</${htmlTag}>`,
    );
  }

  // Pass 2: Convert native components to div with data-native marker
  for (const tag of NATIVE_COMPONENTS) {
    template = template.replace(
      new RegExp(`<${tag}(\\s|/?>)`, 'gi'),
      (_, after) => {
        nativeComponents.push(tag);
        return `<div data-native="${tag}"${after}`;
      },
    );
    template = template.replace(
      new RegExp(`</${tag}>`, 'gi'),
      '</div>',
    );
  }

  // Pass 3: Track custom component tags (kebab-case with hyphen)
  const customTagRegex = /<([a-z][a-z0-9]*-[a-z0-9-]*)/gi;
  let match: RegExpExecArray | null;
  while ((match = customTagRegex.exec(template)) !== null) {
    const tag = match[1].toLowerCase();
    if (!ALL_KNOWN_TAGS.has(tag) && !customComponents.has(tag)) {
      customComponentTags.push(tag);
    }
  }

  return template;
}

/**
 * Walk AST nodes recursively, visiting each node.
 */
function walkAst(node: Node, callback: (node: Node) => void): void {
  callback(node);

  // Visit children
  const children = (node as any).children;
  if (Array.isArray(children)) {
    for (const child of children) {
      walkAst(child, callback);
    }
  }

  // Visit conditional branches (v-if/v-else-if/v-else)
  const branches = (node as any).branches;
  if (Array.isArray(branches)) {
    for (const branch of branches) {
      walkAst(branch, callback);
    }
  }
}

/**
 * Collect reactive variable references from template expressions.
 *
 * Extracts identifiers from {{ }} interpolations and v-bind expressions.
 * Used by the script compiler to determine which variables need setData binding.
 */
function collectReactiveDeps(node: Node, deps: string[]): void {
  // Handle {{ expression }} interpolations
  if (node.type === NodeTypes.INTERPOLATION) {
    const content = (node as any).content;
    if (content?.type === NodeTypes.SIMPLE_EXPRESSION) {
      extractIdentifiers(content.content, deps);
    }
  }

  // Handle v-bind expressions (:attr="expr", v-if="expr", etc.)
  if (node.type === NodeTypes.ELEMENT) {
    const element = node as ElementNode;
    for (const prop of element.props) {
      if (prop.type === NodeTypes.DIRECTIVE && prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION) {
        extractIdentifiers(prop.exp.content, deps);
      }
    }
  }
}

/**
 * Extract variable identifiers from a JavaScript expression string.
 *
 * Uses regex for simplicity. Not perfect for all edge cases (e.g., nested
 * template literals, destructuring), but sufficient for typical template expressions.
 */
function extractIdentifiers(expr: string, deps: string[]): void {
  const BUILTINS: ReadonlySet<string> = new Set([
    // Literals
    'true', 'false', 'null', 'undefined',
    // Context
    'this',
    // Globals
    'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
    'console', 'window', 'document',
    // Vue built-in template globals
    '$emit', '$props', '$attrs', '$slots', '$refs', '$el', '$data', '$options',
    // Common loop variables (from wx:for / v-for)
    'item', 'index', 'key',
  ]);

  const matches = expr.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
  if (!matches) return;

  for (const id of matches) {
    if (!BUILTINS.has(id) && !deps.includes(id)) {
      deps.push(id);
    }
  }
}
