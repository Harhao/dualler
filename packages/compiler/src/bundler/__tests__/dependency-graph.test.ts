import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildDependencyGraph, detectCircularDependencies } from '../dependency-graph';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('dependency-graph', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `dualler-dep-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function createTestFile(relativePath: string, content: string) {
    const fullPath = join(testDir, relativePath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content);
  }

  describe('buildDependencyGraph', () => {
    it('should build graph from Vue files', () => {
      createTestFile('pages/index/index.vue', `
<template><div/></template>
<script setup>
import MyButton from '../../components/MyButton.vue'
</script>
`);

      createTestFile('components/MyButton.vue', `
<template><button/></template>
<script setup></script>
`);

      const files = [
        join(testDir, 'pages/index/index.vue'),
        join(testDir, 'components/MyButton.vue'),
      ];

      const graph = buildDependencyGraph(files, testDir);

      expect(graph.pages.size).toBe(1);
      expect(graph.components.size).toBe(1);
    });

    it('should track component imports', () => {
      createTestFile('pages/index/index.vue', `
<template><div/></template>
<script setup>
import MyButton from '../../components/MyButton.vue'
import MyCard from '../../components/MyCard.vue'
</script>
`);

      const files = [join(testDir, 'pages/index/index.vue')];
      const graph = buildDependencyGraph(files, testDir);

      const pageInfo = graph.pages.get('pages/index/index.vue');
      expect(pageInfo).toBeTruthy();
      expect(pageInfo!.childComponents).toContain('../../components/MyButton.vue');
      expect(pageInfo!.childComponents).toContain('../../components/MyCard.vue');
    });

    it('should classify pages and components correctly', () => {
      createTestFile('pages/index/index.vue', '<template><div/></template>');
      createTestFile('components/MyButton.vue', '<template><button/></template>');

      const files = [
        join(testDir, 'pages/index/index.vue'),
        join(testDir, 'components/MyButton.vue'),
      ];

      const graph = buildDependencyGraph(files, testDir);

      expect(graph.pages.has('pages/index/index.vue')).toBe(true);
      expect(graph.components.has('MyButton')).toBe(true);
    });
  });

  describe('detectCircularDependencies', () => {
    it('should detect no cycles in acyclic graph', () => {
      createTestFile('a.vue', '<template><div/></template>');
      createTestFile('b.vue', '<template><div/></template>');

      const files = [
        join(testDir, 'a.vue'),
        join(testDir, 'b.vue'),
      ];

      const graph = buildDependencyGraph(files, testDir);
      const cycles = detectCircularDependencies(graph);

      expect(cycles).toHaveLength(0);
    });

    it('should handle empty graph', () => {
      const graph = buildDependencyGraph([], testDir);
      const cycles = detectCircularDependencies(graph);

      expect(cycles).toHaveLength(0);
    });
  });
});
