"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStyle = compileStyle;
const postcss_1 = __importDefault(require("postcss"));
async function compileStyle(source, options = {}) {
    const { scoped = true, id = 'default', minify = true } = options;
    const plugins = [
        rpxToPxPlugin(),
        ...(scoped ? [scopedPlugin(id)] : []),
    ];
    const result = await (0, postcss_1.default)(plugins).process(source, {
        from: undefined,
        map: false,
    });
    return result.css;
}
function rpxToPxPlugin() {
    return {
        postcssPlugin: 'dualler-rpx-to-vw',
        Declaration(decl) {
            if (decl.value.includes('rpx')) {
                decl.value = decl.value.replace(/(\d+(?:\.\d+)?)rpx/g, (_, num) => `${(parseFloat(num) / 750 * 100).toFixed(4)}vw`);
            }
        },
    };
}
rpxToPxPlugin.postcss = true;
function scopedPlugin(id) {
    return {
        postcssPlugin: 'dualler-scoped',
        Rule(rule) {
            const scopeAttr = `[data-v-${id}]`;
            rule.selector = rule.selector.replace(/([^,]+)/g, (match) => {
                const trimmed = match.trim();
                if (trimmed.startsWith(':') || trimmed.startsWith('::'))
                    return match;
                return `${match}${scopeAttr}`;
            });
        },
    };
}
scopedPlugin.postcss = true;
//# sourceMappingURL=style-compiler.js.map