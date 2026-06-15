"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTemplate = compileTemplate;
const compiler_dom_1 = require("@vue/compiler-dom");
const TAG_MAP = {
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
function compileTemplate(template) {
    const deps = [];
    const nativeComponents = [];
    const ast = (0, compiler_dom_1.baseParse)(template, {
        getNamespace: () => 0, // HTML namespace
        isVoidTag: (tag) => ['img', 'input', 'br', 'hr'].includes(tag),
        isCustomElement: (tag) => {
            if (NATIVE_COMPONENTS.has(tag)) {
                nativeComponents.push(tag);
                return true;
            }
            return false;
        },
    });
    (0, compiler_dom_1.transform)(ast, {
        nodeTransforms: [
            (node) => transformElementTag(node),
            (node) => collectReactiveDeps(node, deps),
        ],
    });
    const { code } = (0, compiler_dom_1.generate)(ast, {
        mode: 'module',
        sourceMap: false,
    });
    return { code, deps, nativeComponents };
}
function transformElementTag(node) {
    if (node.type !== compiler_dom_1.NodeTypes.ELEMENT)
        return;
    const element = node;
    if (NATIVE_COMPONENTS.has(element.tag)) {
        element.tag = 'div';
        return;
    }
    const mappedTag = TAG_MAP[element.tag];
    if (mappedTag) {
        element.tag = mappedTag;
    }
}
function collectReactiveDeps(node, deps) {
    if (node.type === compiler_dom_1.NodeTypes.INTERPOLATION) {
        const content = node.content;
        if (content?.type === compiler_dom_1.NodeTypes.SIMPLE_EXPRESSION) {
            const expr = content.content;
            const matches = expr.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) ?? [];
            const builtins = new Set(['true', 'false', 'null', 'undefined', 'this', 'Math', 'JSON']);
            matches.filter((m) => !builtins.has(m)).forEach((id) => {
                if (!deps.includes(id))
                    deps.push(id);
            });
        }
    }
}
//# sourceMappingURL=template-compiler.js.map