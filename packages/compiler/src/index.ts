// Parser
export { parseSFC, getScriptBlock, isDuallerComponent } from './parser/sfc-parser';
export type { SFCParseResult, SFCLangInfo } from './parser/sfc-parser';

// Compilers
export { compileTemplate } from './parser/template-compiler';
export type { CompileTemplateOptions, CompileTemplateResult } from './parser/template-compiler';

export { compileScript } from './parser/script-compiler';
export type { CompileScriptOptions, CompileScriptResult } from './parser/script-compiler';

export { compileStyle } from './parser/style-compiler';
export type { CompileStyleOptions } from './parser/style-compiler';

// WXS
export { parseWxsModules, compileWxsModule, compileAllWxs, transformWxsExpressions } from './parser/wxs-compiler';

// Template utilities
export { convertEventAttributes, mapEventName, parseEventBinding } from './parser/template/event-map';
export { convertDirectives } from './parser/template/directives';

// Bundler
export { bundle } from './bundler/package-bundler';
export type { BundleOptions, BundleResult, FileInfo, Manifest } from './bundler/package-bundler';

// Dependency graph
export { buildDependencyGraph, detectCircularDependencies, getAffectedFiles } from './bundler/dependency-graph';
export type { DependencyGraph, ComponentInfo } from './bundler/dependency-graph';

// Watcher
export { FileWatcher, createProjectWatcher } from './watcher/file-watcher';
export type { WatchOptions } from './watcher/file-watcher';

// Dev Server
export { DevServer, startDevServer } from './server/dev-server';
export type { DevServerOptions } from './server/dev-server';

// Runtime
export { generateReactiveBridge, generateSetDataCall, generatePathSetData } from './runtime/reactive-bridge';
export type { ReactiveBridgeOptions } from './runtime/reactive-bridge';

export {
  VUE_TO_DUALLER_LIFECYCLE,
  VUE_TO_PAGE_LIFECYCLE,
  VUE_TO_COMPONENT_LIFECYCLE,
  generatePageLifecycleHandlers,
  generateComponentLifecycleHandlers,
} from './runtime/lifecycle-map';
export type { LifecycleHook, PageLifecycle, ComponentLifecycle } from './runtime/lifecycle-map';

// Generators
export { generatePageHtml, generateComponentHtml, generateRuntimeCompileWrapper } from './generator/page-generator';
export type { PageGeneratorOptions } from './generator/page-generator';

export { generateComponentConstructor, extractProps, extractEmits } from './generator/component-generator';
export type { ComponentGeneratorOptions } from './generator/component-generator';

// Virtual List
export { VirtualList, createVirtualList } from './runtime/virtual-list';
export type { VirtualListOptions } from './runtime/virtual-list';

// Errors
export { CompilerError, TemplateCompileError, ScriptCompileError, StyleCompileError, BundleError } from './errors/compiler-error';
