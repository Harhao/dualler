import { parse as vueParse, SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc';
import { CompilerError } from '../errors/compiler-error';

export interface SFCLangInfo {
  templateLang: string;
  scriptLang: string;
  styleLang: string;
  styleScoped: boolean;
}

export interface SFCParseResult {
  descriptor: SFCDescriptor;
  langInfo: SFCLangInfo;
  /** Whether this SFC uses <script setup> */
  hasScriptSetup: boolean;
  /** Component name derived from filename */
  componentName: string;
}

/**
 * Parse Vue3 SFC source code
 *
 * Uses @vue/compiler-sfc for robust parsing. Handles:
 * - <template> with custom languages (pug, etc.)
 * - <script> and <script setup>
 * - Multiple <style> blocks with different preprocessors
 * - Custom element detection for Dualler built-in tags
 */
export function parseSFC(source: string, filename: string): SFCParseResult {
  const { descriptor, errors } = vueParse(source, {
    filename,
    sourceMap: true,
    templateParseOptions: {
      isCustomElement: (tag) => isDuallerComponent(tag),
    },
  });

  if (errors.length > 0) {
    const firstError = errors[0];
    const loc = 'loc' in firstError ? firstError.loc : undefined;
    throw new CompilerError(
      `SFC parse error: ${firstError.message}`,
      filename,
      loc?.start.line,
      loc?.start.column,
      'SFC_PARSE_ERROR',
    );
  }

  const langInfo: SFCLangInfo = {
    templateLang: descriptor.template?.lang ?? 'html',
    scriptLang: (descriptor.scriptSetup ?? descriptor.script)?.lang ?? 'js',
    styleLang: descriptor.styles[0]?.lang ?? 'css',
    styleScoped: descriptor.styles.some(s => s.scoped),
  };

  const componentName = deriveComponentName(filename);
  const hasScriptSetup = !!descriptor.scriptSetup;

  return { descriptor, langInfo, hasScriptSetup, componentName };
}

/**
 * Get the effective script block (script setup takes priority)
 */
export function getScriptBlock(descriptor: SFCDescriptor): SFCScriptBlock | null {
  return descriptor.scriptSetup ?? descriptor.script;
}

/**
 * Derive a component name from the file path
 *
 * examples:
 *   pages/index/index.vue → Index
 *   components/MyButton.vue → MyButton
 *   src/pages/detail/detail.vue → Detail
 */
function deriveComponentName(filename: string): string {
  const baseName = filename
    .replace(/^.*[\\/]/, '')     // remove path
    .replace(/\.\w+$/, '')       // remove extension
    .replace(/[^a-zA-Z0-9]/g, ' '); // replace non-alphanumeric

  // PascalCase
  return baseName
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Dualler built-in component tags
 *
 * These tags are recognized by the template compiler and mapped to
 * appropriate HTML elements or handled via same-layer rendering.
 */
const DUELLER_BUILTIN_TAGS = new Set([
  // Layout
  'view', 'scroll-view', 'swiper', 'swiper-item', 'movable-area', 'movable-view',
  // Content
  'text', 'rich-text', 'icon', 'progress',
  // Form
  'button', 'checkbox', 'checkbox-group', 'editor', 'form',
  'input', 'label', 'picker', 'picker-view', 'picker-view-column',
  'radio', 'radio-group', 'slider', 'switch', 'textarea',
  // Media
  'image', 'video', 'audio', 'camera', 'live-player', 'live-pusher',
  // Navigation
  'navigator', 'web-view',
  // Map
  'map',
  // Canvas
  'canvas',
  // Open data
  'open-data',
  // Ad
  'ad',
]);

/**
 * Check if a tag is a Dualler built-in component
 */
export function isDuallerComponent(tag: string): boolean {
  return DUELLER_BUILTIN_TAGS.has(tag);
}
