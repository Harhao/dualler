import { parse as babelParse, ParserOptions } from '@babel/parser';
// @ts-expect-error - @babel/traverse lacks proper type declarations
import _traverse, { NodePath, Visitor } from '@babel/traverse';
// @ts-expect-error - @babel/generator lacks proper type declarations
import _generate from '@babel/generator';
import * as t from '@babel/types';
import { ScriptCompileError } from '../errors/compiler-error';

// Handle CJS/ESM interop for Babel packages
const traverse: typeof _traverse = (_traverse as any).default ?? _traverse;
const generate: typeof _generate = (_generate as any).default ?? _generate;

/**
 * Vue3 API → Dualler runtime API mapping.
 *
 * The Dualler runtime provides equivalents that work within the
 * mini-program dual-thread architecture (logic layer + render layer).
 */
const VUE_TO_DUALLER_MAP: Readonly<Record<string, string>> = Object.freeze({
  // Reactivity
  'ref': '__dualler_ref',
  'reactive': '__dualler_reactive',
  'computed': '__dualler_computed',
  'watch': '__dualler_watch',
  'watchEffect': '__dualler_watchEffect',
  'shallowRef': '__dualler_shallowRef',
  'toRef': '__dualler_toRef',
  'toRefs': '__dualler_toRefs',
  'unref': '__dualler_unref',
  'isRef': '__dualler_isRef',
  'isReactive': '__dualler_isReactive',
  'isProxy': '__dualler_isProxy',
  'markRaw': '__dualler_markRaw',
  'toRaw': '__dualler_toRaw',

  // Lifecycle hooks
  'onBeforeMount': '__dualler_onBeforeMount',
  'onMounted': '__dualler_onReady',
  'onBeforeUpdate': '__dualler_onBeforeUpdate',
  'onUpdated': '__dualler_onUpdated',
  'onBeforeUnmount': '__dualler_onBeforeUnload',
  'onUnmounted': '__dualler_onUnload',
  'onActivated': '__dualler_onShow',
  'onDeactivated': '__dualler_onHide',
  'onErrorCaptured': '__dualler_onErrorCaptured',

  // Dependency injection
  'provide': '__dualler_provide',
  'inject': '__dualler_inject',

  // Utilities
  'nextTick': '__dualler_nextTick',
  'defineComponent': '__dualler_defineComponent',

  // App-level (used in app.vue)
  'createApp': '__dualler_createApp',
});

/** Script setup macros that need special rewriting */
const SCRIPT_SETUP_MACROS: ReadonlySet<string> = new Set([
  'defineProps', 'defineEmits', 'defineExpose', 'defineOptions', 'defineSlots',
]);

/** Lifecycle hooks that map to mini-program Page/Component events */
const LIFECYCLE_HOOKS: ReadonlySet<string> = new Set([
  'onBeforeMount', 'onMounted', 'onBeforeUpdate', 'onUpdated',
  'onBeforeUnmount', 'onUnmounted', 'onActivated', 'onDeactivated',
  'onErrorCaptured',
]);

/** Functions that create reactive state */
const REACTIVE_CREATORS: ReadonlySet<string> = new Set([
  'ref', 'reactive', 'shallowRef', 'computed',
  '__dualler_ref', '__dualler_reactive', '__dualler_shallowRef', '__dualler_computed',
]);

export interface CompileScriptOptions {
  /** Source file path for error reporting */
  filename?: string;
  /** Whether this is a <script setup> block */
  isSetup?: boolean;
  /** Page/component name for wrapper generation */
  componentName?: string;
  /** Whether to generate Page() wrapper (for pages) */
  wrapAsPage?: boolean;
  /** Whether to generate Component() wrapper (for components) */
  wrapAsComponent?: boolean;
  /** Reactive deps from template (for setData optimization) */
  templateReactiveDeps?: readonly string[];
}

export interface CompileScriptResult {
  /** Compiled JavaScript code */
  code: string;
  /** Detected imports (module → names[]) */
  imports: Map<string, string[]>;
  /** Detected reactive variables (need setData binding) */
  reactiveVars: string[];
  /** Detected lifecycle hooks */
  lifecycleHooks: string[];
  /** Whether this uses <script setup> */
  isSetup: boolean;
}

/**
 * Compile Vue3 script to Dualler runtime JavaScript.
 *
 * Handles:
 * - Vue API → Dualler API mapping
 * - Import rewriting (vue → dualler://runtime)
 * - <script setup> macro rewriting
 * - Page/Component wrapper generation
 * - setData bridge code generation
 */
export function compileScript(
  source: string,
  options: CompileScriptOptions = {},
): CompileScriptResult {
  const {
    filename = 'unknown',
    isSetup = false,
    componentName = 'anonymous',
    wrapAsPage = false,
    wrapAsComponent = false,
    templateReactiveDeps = [],
  } = options;

  const imports = new Map<string, string[]>();
  const reactiveVars: string[] = [];
  const lifecycleHooks: string[] = [];

  // Parse with error recovery for better diagnostics
  let ast: t.File;
  try {
    const parserOpts: ParserOptions = {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
      errorRecovery: true,
    };
    ast = babelParse(source, parserOpts);
  } catch (err: any) {
    throw new ScriptCompileError(
      `Failed to parse script: ${err.message}`,
      filename,
      err.loc?.line,
      err.loc?.column,
    );
  }

  // Pass 1: Collect metadata (read-only, no mutations)
  collectMetadata(ast, imports, reactiveVars, lifecycleHooks);

  // Pass 2: Transform AST
  const visitor: Visitor = {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      rewriteVueImports(path);
    },
    CallExpression(path: NodePath<t.CallExpression>) {
      rewriteVueApiCalls(path);
    },
  };

  traverse(ast, visitor);

  // Generate output code
  let { code } = generate(ast, { retainLines: true });

  // Wrap as Page or Component if requested
  if (wrapAsPage) {
    code = wrapAsPageCode(code, componentName, reactiveVars, templateReactiveDeps);
  } else if (wrapAsComponent) {
    code = wrapAsComponentCode(code, componentName, reactiveVars, templateReactiveDeps);
  }

  return {
    code,
    imports,
    reactiveVars,
    lifecycleHooks,
    isSetup,
  };
}

/**
 * Rewrite `import { ... } from 'vue'` to use Dualler runtime.
 */
function rewriteVueImports(path: NodePath<t.ImportDeclaration>): void {
  if (path.node.source.value !== 'vue') return;

  const specifiers = path.node.specifiers.map((spec: t.ImportDeclaration['specifiers'][number]) => {
    if (!t.isImportSpecifier(spec)) return spec;

    const name = t.isIdentifier(spec.imported)
      ? spec.imported.name
      : (spec.imported as t.StringLiteral).value;
    const duallerName = VUE_TO_DUALLER_MAP[name] ?? name;

    return t.importSpecifier(spec.local, t.identifier(duallerName));
  });

  path.node.source.value = 'dualler://runtime';
  path.node.specifiers = specifiers;
}

/**
 * Rewrite Vue API calls and script setup macros.
 */
function rewriteVueApiCalls(path: NodePath<t.CallExpression>): void {
  if (!t.isIdentifier(path.node.callee)) return;

  const name = path.node.callee.name;

  // Check Vue API mappings
  const duallerName = VUE_TO_DUALLER_MAP[name];
  if (duallerName) {
    path.node.callee = t.identifier(duallerName);
    return;
  }

  // Check script setup macros
  if (SCRIPT_SETUP_MACROS.has(name)) {
    path.node.callee = t.identifier(`__dualler_${name}`);
  }
}

/**
 * Collect metadata from AST without modifying it.
 */
function collectMetadata(
  ast: t.File,
  imports: Map<string, string[]>,
  reactiveVars: string[],
  lifecycleHooks: string[],
): void {
  traverse(ast, {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const source = path.node.source.value;
      const names = path.node.specifiers
        .filter((s: any): s is t.ImportSpecifier => t.isImportSpecifier(s))
        .map((s: t.ImportSpecifier) =>
          t.isIdentifier(s.imported)
            ? s.imported.name
            : (s.imported as t.StringLiteral).value,
        );

      if (names.length > 0) {
        imports.set(source, names);
      }
    },

    VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
      if (!t.isCallExpression(path.node.init) || !t.isIdentifier(path.node.init.callee)) return;

      const fnName = path.node.init.callee.name;
      if (REACTIVE_CREATORS.has(fnName) && t.isIdentifier(path.node.id)) {
        reactiveVars.push(path.node.id.name);
      }
    },

    CallExpression(path: NodePath<t.CallExpression>) {
      if (!t.isIdentifier(path.node.callee)) return;

      const name = path.node.callee.name;
      const duallerName = VUE_TO_DUALLER_MAP[name];
      if (duallerName && LIFECYCLE_HOOKS.has(name)) {
        lifecycleHooks.push(name);
      }
    },
  });
}

/**
 * Generate Page() wrapper code for page-level SFCs.
 *
 * Wraps the compiled script in a Page({}) constructor call,
 * with automatic data binding from reactive variables.
 */
function wrapAsPageCode(
  scriptCode: string,
  pageName: string,
  reactiveVars: readonly string[],
  templateReactiveDeps: readonly string[],
): string {
  // Filter to only reactive vars that appear in template
  const dataVars = filterTemplateVars(reactiveVars, templateReactiveDeps);
  const dataInit = dataVars.map(v => `      ${v}: __dualler_unwrap(${v}),`).join('\n');
  const methodExports = dataVars.map(v => `      ${v}: __dualler_data__.${v},`).join('\n');

  return `// Dualler Page: ${pageName}
// Auto-generated wrapper for mini-program Page constructor
(function() {
  // === User script start ===
  ${scriptCode}
  // === User script end ===

  // Helper to unwrap ref values
  function __dualler_unwrap(val) {
    return val != null && typeof val === 'object' && 'value' in val ? val.value : val;
  }

  // Collect reactive data for setData
  var __dualler_data__ = {
${dataInit}
  };

  // Create Page
  Page({
    data: __dualler_data__,

    onLoad: function(options) {
      if (typeof __dualler_onBeforeMount === 'function') __dualler_onBeforeMount(options);
    },

    onReady: function() {
      if (typeof __dualler_onReady === 'function') __dualler_onReady();
    },

    onShow: function() {
      if (typeof __dualler_onShow === 'function') __dualler_onShow();
    },

    onHide: function() {
      if (typeof __dualler_onHide === 'function') __dualler_onHide();
    },

    onUnload: function() {
      if (typeof __dualler_onBeforeUnload === 'function') __dualler_onBeforeUnload();
      if (typeof __dualler_onUnload === 'function') __dualler_onUnload();
    },

    onError: function(err) {
      if (typeof __dualler_onErrorCaptured === 'function') __dualler_onErrorCaptured(err);
    },
  });
})();`;
}

/**
 * Generate Component() wrapper code for component-level SFCs.
 *
 * Wraps the compiled script in a Component({}) constructor call,
 * with props, data, methods, and lifecycle support.
 */
function wrapAsComponentCode(
  scriptCode: string,
  componentName: string,
  reactiveVars: readonly string[],
  templateReactiveDeps: readonly string[],
): string {
  const dataVars = filterTemplateVars(reactiveVars, templateReactiveDeps);
  const dataInit = dataVars.map(v => `      ${v}: __dualler_unwrap(${v}),`).join('\n');

  return `// Dualler Component: ${componentName}
// Auto-generated wrapper for mini-program Component constructor
(function() {
  // === User script start ===
  ${scriptCode}
  // === User script end ===

  // Helper to unwrap ref values
  function __dualler_unwrap(val) {
    return val != null && typeof val === 'object' && 'value' in val ? val.value : val;
  }

  // Collect reactive data for setData
  var __dualler_data__ = {
${dataInit}
  };

  // Create Component
  Component({
    data: __dualler_data__,

    properties: __dualler_props_definition__ || {},

    methods: {
      $emit: function(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.triggerEvent(event, args.length === 1 ? args[0] : args);
      },
    },

    lifetimes: {
      created: function() {
        if (typeof __dualler_onBeforeMount === 'function') __dualler_onBeforeMount();
      },
      attached: function() {
        if (typeof __dualler_onReady === 'function') __dualler_onReady();
      },
      detached: function() {
        if (typeof __dualler_onBeforeUnload === 'function') __dualler_onBeforeUnload();
        if (typeof __dualler_onUnload === 'function') __dualler_onUnload();
      },
    },

    pageLifetimes: {
      show: function() {
        if (typeof __dualler_onShow === 'function') __dualler_onShow();
      },
      hide: function() {
        if (typeof __dualler_onHide === 'function') __dualler_onHide();
      },
    },
  });
})();`;
}

/**
 * Filter reactive vars to only those used in the template.
 * If templateDeps is empty, include all reactive vars (conservative approach).
 */
function filterTemplateVars(
  reactiveVars: readonly string[],
  templateDeps: readonly string[],
): string[] {
  if (templateDeps.length === 0) return [...reactiveVars];
  return reactiveVars.filter(v => templateDeps.includes(v));
}
