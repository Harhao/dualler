"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileScript = compileScript;
const parser_1 = require("@babel/parser");
// @ts-ignore
const traverse_1 = __importDefault(require("@babel/traverse"));
// @ts-ignore
const generator_1 = __importDefault(require("@babel/generator"));
const t = __importStar(require("@babel/types"));
const VUE_TO_DUALLER_MAP = {
    'ref': '__dualler_ref',
    'reactive': '__dualler_reactive',
    'computed': '__dualler_computed',
    'watch': '__dualler_watch',
    'onMounted': '__dualler_onReady',
    'onUnmounted': '__dualler_onUnload',
    'nextTick': '__dualler_nextTick',
};
function compileScript(source, pageId) {
    const ast = (0, parser_1.parse)(source, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    (0, traverse_1.default)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'vue') {
                const specifiers = path.node.specifiers.map((spec) => {
                    if (t.isImportSpecifier(spec)) {
                        const name = t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;
                        const duallerName = VUE_TO_DUALLER_MAP[name] ?? name;
                        return t.importSpecifier(spec.local, t.identifier(duallerName));
                    }
                    return spec;
                });
                path.node.source.value = 'dualler://runtime';
                path.node.specifiers = specifiers;
            }
        },
        CallExpression(path) {
            if (t.isIdentifier(path.node.callee)) {
                const name = path.node.callee.name;
                const duallerName = VUE_TO_DUALLER_MAP[name];
                if (duallerName) {
                    path.node.callee = t.identifier(duallerName);
                }
            }
        },
    });
    const { code } = (0, generator_1.default)(ast);
    return code;
}
//# sourceMappingURL=script-compiler.js.map