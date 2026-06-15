import { parse as babelParse } from '@babel/parser';
// @ts-ignore
import traverse from '@babel/traverse';
// @ts-ignore
import generate from '@babel/generator';
import * as t from '@babel/types';

const VUE_TO_DUALLER_MAP: Record<string, string> = {
  'ref': '__dualler_ref',
  'reactive': '__dualler_reactive',
  'computed': '__dualler_computed',
  'watch': '__dualler_watch',
  'onMounted': '__dualler_onReady',
  'onUnmounted': '__dualler_onUnload',
  'nextTick': '__dualler_nextTick',
};

export function compileScript(source: string, pageId: string): string {
  const ast = babelParse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    ImportDeclaration(path: any) {
      if (path.node.source.value === 'vue') {
        const specifiers = path.node.specifiers.map((spec: any) => {
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
    CallExpression(path: any) {
      if (t.isIdentifier(path.node.callee)) {
        const name = path.node.callee.name;
        const duallerName = VUE_TO_DUALLER_MAP[name];
        if (duallerName) {
          path.node.callee = t.identifier(duallerName);
        }
      }
    },
  });

  const { code } = generate(ast);
  return code;
}
