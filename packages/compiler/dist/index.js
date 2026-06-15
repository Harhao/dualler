"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundle = exports.compileStyle = exports.compileScript = exports.compileTemplate = exports.parseSFC = void 0;
var sfc_parser_1 = require("./parser/sfc-parser");
Object.defineProperty(exports, "parseSFC", { enumerable: true, get: function () { return sfc_parser_1.parseSFC; } });
var template_compiler_1 = require("./parser/template-compiler");
Object.defineProperty(exports, "compileTemplate", { enumerable: true, get: function () { return template_compiler_1.compileTemplate; } });
var script_compiler_1 = require("./parser/script-compiler");
Object.defineProperty(exports, "compileScript", { enumerable: true, get: function () { return script_compiler_1.compileScript; } });
var style_compiler_1 = require("./parser/style-compiler");
Object.defineProperty(exports, "compileStyle", { enumerable: true, get: function () { return style_compiler_1.compileStyle; } });
var package_bundler_1 = require("./bundler/package-bundler");
Object.defineProperty(exports, "bundle", { enumerable: true, get: function () { return package_bundler_1.bundle; } });
//# sourceMappingURL=index.js.map