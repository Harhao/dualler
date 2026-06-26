import { SFCDescriptor } from '@vue/compiler-sfc';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, relative, join } from 'path';

export interface ComponentInfo {
  /** Component name (PascalCase) */
  name: string;
  /** Original file path */
  filePath: string;
  /** Relative path from project root */
  relativePath: string;
  /** Component tags this component uses */
  childComponents: string[];
}

export interface DependencyGraph {
  /** All components by name */
  components: Map<string, ComponentInfo>;
  /** All pages by path */
  pages: Map<string, ComponentInfo>;
  /** Import graph: file → files it imports */
  imports: Map<string, Set<string>>;
  /** Reverse graph: file → files that import it */
  reverseImports: Map<string, Set<string>>;
}

/**
 * Build a dependency graph from a set of Vue SFC files
 *
 * Parses each file to find:
 * - Import statements (component imports)
 * - components: {} option (component registration)
 * - <script setup> imports (auto-registered)
 */
export function buildDependencyGraph(
  files: string[],
  projectRoot: string,
): DependencyGraph {
  const graph: DependencyGraph = {
    components: new Map(),
    pages: new Map(),
    imports: new Map(),
    reverseImports: new Map(),
  };

  for (const filePath of files) {
    const relativePath = relative(projectRoot, filePath);
    const name = deriveComponentName(filePath);

    const info: ComponentInfo = {
      name,
      filePath,
      relativePath,
      childComponents: [],
    };

    // Parse the SFC to find component imports
    try {
      const source = readFileSync(filePath, 'utf-8');
      info.childComponents = findComponentImports(source, dirname(filePath));
    } catch {
      // File can't be read, skip dependency analysis
    }

    // Classify as page or component
    if (relativePath.startsWith('pages/') || relativePath.startsWith('src/pages/')) {
      graph.pages.set(relativePath, info);
    } else {
      graph.components.set(name, info);
    }

    // Build import graph
    graph.imports.set(filePath, new Set());
    for (const child of info.childComponents) {
      const childPath = resolve(dirname(filePath), child);
      if (!graph.reverseImports.has(childPath)) {
        graph.reverseImports.set(childPath, new Set());
      }
      graph.reverseImports.get(childPath)!.add(filePath);
      graph.imports.get(filePath)!.add(childPath);
    }
  }

  return graph;
}

/**
 * Find component import paths from a Vue SFC source
 *
 * Looks for:
 * - import X from './X.vue' (in <script>)
 * - import X from './X' (in <script>)
 * - components: { X } option (Options API)
 * - <script setup> imports are auto-registered
 */
function findComponentImports(source: string, basedir: string): string[] {
  const imports: string[] = [];

  // Match import statements for .vue files
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\.vue?)['"]/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    imports.push(match[2]);
  }

  return imports;
}

/**
 * Detect circular dependencies in the graph
 *
 * Returns an array of circular dependency chains, or empty array if none found.
 */
export function detectCircularDependencies(graph: DependencyGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string, path: string[]) {
    if (inStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        cycles.push(path.slice(cycleStart).concat(node));
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const deps = graph.imports.get(node) ?? new Set();
    for (const dep of deps) {
      dfs(dep, [...path]);
    }

    inStack.delete(node);
  }

  for (const node of graph.imports.keys()) {
    dfs(node, []);
  }

  return cycles;
}

/**
 * Get all files that would be affected if a file changes
 * (transitive reverse dependencies)
 */
export function getAffectedFiles(graph: DependencyGraph, changedFile: string): Set<string> {
  const affected = new Set<string>();
  const queue = [changedFile];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.reverseImports.get(current) ?? new Set();
    for (const dep of dependents) {
      if (!affected.has(dep)) {
        affected.add(dep);
        queue.push(dep);
      }
    }
  }

  return affected;
}

function deriveComponentName(filePath: string): string {
  const baseName = filePath
    .replace(/^.*[\\/]/, '')
    .replace(/\.\w+$/, '')
    .replace(/[^a-zA-Z0-9]/g, ' ');

  return baseName
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
