"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSFC = parseSFC;
exports.isDuallerComponent = isDuallerComponent;
const compiler_sfc_1 = require("@vue/compiler-sfc");
function parseSFC(source, filename) {
    const { descriptor, errors } = (0, compiler_sfc_1.parse)(source, {
        filename,
        sourceMap: true,
        templateParseOptions: {
            isCustomElement: (tag) => isDuallerComponent(tag),
        },
    });
    if (errors.length > 0) {
        throw new Error(`SFC parse errors in ${filename}: ${errors.map(e => e.message).join('\n')}`);
    }
    const langInfo = {
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
function isDuallerComponent(tag) {
    return DUELLER_BUILTIN_TAGS.has(tag);
}
//# sourceMappingURL=sfc-parser.js.map