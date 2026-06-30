import { parse as vueParse } from '@vue/compiler-sfc';
import type { SFCParseResult } from '../types';

/**
 * Parse a Vue SFC source string using @vue/compiler-sfc and return
 * a descriptor normalized to our own SFCParseResult shape.
 */
export function parseVueSFC(source: string, filename = 'Component.vue'): SFCParseResult {
  const parsed = vueParse(source, { filename });
  const desc = parsed.descriptor;

  const result: SFCParseResult = {
    descriptor: {
      source: desc.source,
    },
  };

  // Template
  if (desc.template) {
    result.descriptor.template = {
      content: desc.template.content,
      attrs: desc.template.attrs as Record<string, string | boolean>,
    };
  }

  // Scripts — collect both <script> and <script setup>
  const scripts: Array<{ content: string; attrs: Record<string, string | boolean> }> = [];

  if (desc.script) {
    scripts.push({
      content: desc.script.content,
      attrs: desc.script.attrs as Record<string, string | boolean>,
    });
  }
  if (desc.scriptSetup) {
    scripts.push({
      content: desc.scriptSetup.content,
      attrs: desc.scriptSetup.attrs as Record<string, string | boolean>,
    });
  }
  if (scripts.length) {
    result.descriptor.scripts = scripts;
  }

  // Styles
  if (desc.styles.length) {
    result.descriptor.styles = desc.styles.map((s) => ({
      content: s.content,
      attrs: s.attrs as Record<string, string | boolean>,
      modules: s.module !== undefined,
    }));
  }

  // Custom blocks
  if (desc.customBlocks.length) {
    result.descriptor.customBlocks = desc.customBlocks.map((cb) => ({
      type: cb.type,
      content: cb.content,
      attrs: cb.attrs as Record<string, string | boolean>,
    }));
  }

  return result;
}
