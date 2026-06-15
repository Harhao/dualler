import { parse as vueParse, SFCDescriptor } from '@vue/compiler-sfc';

export interface SFCLangInfo {
  templateLang: string;
  scriptLang: string;
  styleLang: string;
}

export interface SFCParseResult {
  descriptor: SFCDescriptor;
  langInfo: SFCLangInfo;
}

export function parseSFC(source: string, filename: string): SFCParseResult {
  const { descriptor, errors } = vueParse(source, {
    filename,
    sourceMap: true,
    templateParseOptions: {
      isCustomElement: (tag) => isDuallerComponent(tag),
    },
  });

  if (errors.length > 0) {
    throw new Error(`SFC parse errors in ${filename}: ${errors.map(e => e.message).join('\n')}`);
  }

  const langInfo: SFCLangInfo = {
    templateLang: descriptor.template?.lang ?? 'html',
    scriptLang: descriptor.script?.lang ?? 'js',
    styleLang: descriptor.styles[0]?.lang ?? 'css',
  };

  return { descriptor, langInfo };
}

const DUELLER_BUILTIN_TAGS = new Set([
  'view', 'text', 'image', 'scroll-view', 'swiper', 'swiper-item',
  'button', 'input', 'textarea', 'checkbox', 'radio', 'picker',
  'slider', 'switch', 'video', 'audio', 'camera', 'map', 'canvas',
  'navigator', 'web-view', 'icon', 'progress', 'rich-text',
  'live-player', 'live-pusher',
]);

export function isDuallerComponent(tag: string): boolean {
  return DUELLER_BUILTIN_TAGS.has(tag);
}
