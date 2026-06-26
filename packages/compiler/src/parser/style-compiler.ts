import postcss from 'postcss';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { StyleCompileError } from '../errors/compiler-error';

export interface CompileStyleOptions {
  /** Enable scoped styles (adds data-v-{id} attribute selectors) */
  scoped?: boolean;
  /** Scope ID for scoped styles */
  id?: string;
  /** Enable minification */
  minify?: boolean;
  /** Design width for rpx conversion (default: 750) */
  designWidth?: number;
  /** Source file path for error reporting */
  filename?: string;
  /** Base directory for resolving @import paths */
  basedir?: string;
}

/**
 * Compile CSS for Dualler mini-program
 *
 * Pipeline:
 * 1. Resolve @import statements
 * 2. Convert rpx units to vw (responsive layout)
 * 3. Add scoped attribute selectors
 * 4. Validate CSS (warn about unsupported features)
 */
export async function compileStyle(
  source: string,
  options: CompileStyleOptions = {},
): Promise<string> {
  const {
    scoped = true,
    id = 'default',
    designWidth = 750,
    filename,
    basedir,
  } = options;

  try {
    const plugins: postcss.AcceptedPlugin[] = [
      importPlugin(basedir),
      rpxToVwPlugin(designWidth),
      ...(scoped ? [scopedPlugin(id)] : []),
      cssValidator(),
    ];

    const result = await postcss(plugins).process(source, {
      from: filename,
      map: false,
    });

    return result.css;
  } catch (err: any) {
    if (err instanceof StyleCompileError) throw err;
    throw new StyleCompileError(
      `Style compilation failed: ${err.message}`,
      filename,
      err.line,
      err.column,
    );
  }
}

/**
 * Plugin: Resolve @import statements
 *
 * Supports:
 *   @import './path.css';
 *   @import url('./path.css');
 *   @import './path.css' screen;
 */
function importPlugin(basedir?: string): postcss.Plugin {
  return {
    postcssPlugin: 'dualler-import',
    AtRule: {
      import(atRule) {
        const value = atRule.params.replace(/url\(|\)|['"]/g, '').trim();
        if (!value.startsWith('.') && !value.startsWith('/')) return;

        const importPath = value;
        const resolveDir = basedir ?? process.cwd();
        const fullPath = resolve(resolveDir, importPath);

        if (existsSync(fullPath)) {
          try {
            const content = readFileSync(fullPath, 'utf-8');
            // Parse imported CSS and insert nodes
            const importedRoot = postcss.parse(content, { from: fullPath });
            atRule.replaceWith(importedRoot.nodes);
          } catch {
            // If file can't be read, leave the @import as-is
          }
        }
        // If file doesn't exist, leave the @import as-is (could be handled by bundler)
      },
    },
  };
}
importPlugin.postcss = true;

/**
 * Plugin: Convert rpx units to vw
 *
 * Design width defaults to 750rpx (WeChat standard).
 * Conversion: 750rpx = 100vw → 1rpx = 100/750 vw ≈ 0.1333vw
 */
function rpxToVwPlugin(designWidth: number): postcss.Plugin {
  return {
    postcssPlugin: 'dualler-rpx-to-vw',
    Declaration(decl) {
      if (decl.value.includes('rpx')) {
        decl.value = decl.value.replace(
          /(\d+(?:\.\d+)?)rpx/g,
          (_, num) => `${(parseFloat(num) / designWidth * 100).toFixed(4)}vw`
        );
      }
    },
  };
}
rpxToVwPlugin.postcss = true;

/**
 * Plugin: Add scoped attribute selectors
 *
 * Adds [data-v-{id}] to selectors following Vue3 scoped CSS behavior:
 * - Adds scope to the end of each simple selector
 * - For pseudo-elements, adds scope before the pseudo-element
 * - Handles :global() and :deep() selectors
 * - Already-scoped selectors are skipped
 */
function scopedPlugin(id: string): postcss.Plugin {
  const scopeAttr = `[data-v-${id}]`;

  return {
    postcssPlugin: 'dualler-scoped',
    Rule(rule) {
      // Skip rules inside :global()
      if (rule.parent?.type === 'atrule' && (rule.parent as any).name === 'global') {
        return;
      }

      // Skip if already scoped
      if (rule.selector.includes(scopeAttr)) {
        return;
      }

      rule.selector = rule.selector.replace(/([^,]+)/g, (match) => {
        const trimmed = match.trim();

        // Skip standalone pseudo-elements
        if (trimmed.startsWith('::')) return match;

        // Skip :global() selectors - remove the wrapper
        if (trimmed.startsWith(':global(')) {
          return trimmed.replace(/^:global\((.+)\)$/, '$1');
        }

        // Handle :deep() selectors - add scope to inner selector
        if (trimmed.startsWith(':deep(')) {
          return trimmed.replace(/^:deep\((.+)\)$/, `$1 ${scopeAttr}`);
        }

        // Skip standalone pseudo-classes
        if (trimmed.startsWith(':') && !trimmed.includes('::')) return match;

        // Handle pseudo-elements within selectors
        // .container::before → .container[data-v-xxx]::before
        const pseudoMatch = trimmed.match(/^(.+?)(::\w+)$/);
        if (pseudoMatch) {
          const selector = pseudoMatch[1].trim();
          const pseudo = pseudoMatch[2];
          // Don't add scope if selector is just a pseudo-class
          if (selector.startsWith(':') && !selector.includes(' ')) return match;
          return `${selector}${scopeAttr}${pseudo}`;
        }

        // Add scope attribute to the end of the selector
        return `${match}${scopeAttr}`;
      });
    },
  };
}
scopedPlugin.postcss = true;

/**
 * Plugin: Validate CSS for mini-program compatibility.
 *
 * Currently a no-op placeholder. Future enhancements:
 * - Warn about CSS features with limited WebView support
 * - Flag potential performance issues (e.g., expensive selectors)
 */
function cssValidator(): postcss.Plugin {
  return {
    postcssPlugin: 'dualler-css-validator',
    // Intentionally empty - validation rules added as needed
  };
}
cssValidator.postcss = true;
