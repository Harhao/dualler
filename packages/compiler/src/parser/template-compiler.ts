import { baseParse, transform, generate, NodeTypes, TemplateChildNode, ElementNode } from '@vue/compiler-dom';

const TAG_MAP: Record<string, string> = {
  'view': 'div',
  'text': 'span',
  'image': 'img',
  'scroll-view': 'div',
  'swiper': 'div',
  'navigator': 'a',
  'web-view': 'iframe',
  'icon': 'span',
  'progress': 'div',
  'rich-text': 'div',
};

const NATIVE_COMPONENTS = new Set(['video', 'map', 'live-player', 'live-pusher']);

export interface CompileTemplateResult {
  code: string;
  deps: string[];
  nativeComponents: string[];
}

export function compileTemplate(template: string): CompileTemplateResult {
  const deps: string[] = [];
  const nativeComponents: string[] = [];

  const ast = baseParse(template, {
    getNamespace: () => 0, // HTML namespace
    isVoidTag: (tag: string) => ['img', 'input', 'br', 'hr'].includes(tag),
    isCustomElement: (tag: string) => {
      if (NATIVE_COMPONENTS.has(tag)) {
        nativeComponents.push(tag);
        return true;
      }
      return false;
    },
  });

  transform(ast, {
    nodeTransforms: [
      (node: any) => transformElementTag(node),
      (node: any) => collectReactiveDeps(node, deps),
    ],
  });

  const { code } = generate(ast, {
    mode: 'module',
    sourceMap: false,
  });

  return { code, deps, nativeComponents };
}

function transformElementTag(node: TemplateChildNode) {
  if (node.type !== NodeTypes.ELEMENT) return;
  const element = node as ElementNode;

  if (NATIVE_COMPONENTS.has(element.tag)) {
    element.tag = 'div';
    return;
  }

  const mappedTag = TAG_MAP[element.tag];
  if (mappedTag) {
    element.tag = mappedTag;
  }
}

function collectReactiveDeps(node: TemplateChildNode, deps: string[]) {
  if (node.type === NodeTypes.INTERPOLATION) {
    const content = (node as any).content;
    if (content?.type === NodeTypes.SIMPLE_EXPRESSION) {
      const expr = content.content;
      const matches = expr.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) ?? [];
      const builtins = new Set(['true', 'false', 'null', 'undefined', 'this', 'Math', 'JSON']);
      matches.filter((m: string) => !builtins.has(m)).forEach((id: string) => {
        if (!deps.includes(id)) deps.push(id);
      });
    }
  }
}
