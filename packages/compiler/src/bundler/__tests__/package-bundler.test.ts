import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bundle } from '../package-bundler';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('package-bundler', () => {
  let testDir: string;
  let outputDir: string;
  let srcDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `dualler-test-${Date.now()}`);
    srcDir = join(testDir, 'src');
    outputDir = join(testDir, 'dist');
    mkdirSync(join(srcDir, 'pages', 'index'), { recursive: true });
    mkdirSync(join(srcDir, 'pages', 'detail'), { recursive: true });
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function createFile(path: string, content: string) {
    writeFileSync(join(testDir, path), content);
  }

  it('should bundle a simple page', async () => {
    createFile('src/app.vue', `
<template><div/></template>
<script setup>
console.log('App loaded')
</script>
<style>
page { font-size: 28rpx; }
</style>
`);

    createFile('src/pages/index/index.vue', `
<template>
  <view class="container">
    <text>{{ message }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello Dualler')
</script>

<style scoped>
.container { padding: 20rpx; }
</style>
`);

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    expect(result.files.size).toBeGreaterThan(0);
    expect(result.manifest.appId).toBe('com.test.app');
    expect(result.manifest.pages).toContain('pages/index/index');

    // Check output files exist
    expect(existsSync(join(outputDir, 'app.js'))).toBe(true);
    expect(existsSync(join(outputDir, 'pages/index/index.html'))).toBe(true);
    expect(existsSync(join(outputDir, 'pages/index/index.js'))).toBe(true);
    expect(existsSync(join(outputDir, 'pages/index/index.css'))).toBe(true);
    expect(existsSync(join(outputDir, 'manifest.json'))).toBe(true);
  });

  it('should compile template with tag mapping', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');

    createFile('src/pages/index/index.vue', `
<template>
  <view class="container">
    <text>Hello</text>
    <image src="test.png" />
  </view>
</template>
<script setup></script>
`);

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    const html = readFileSync(join(outputDir, 'pages/index/index.html'), 'utf-8');
    expect(html).toContain('<div');
    expect(html).toContain('<span');
    expect(html).toContain('<img');
  });

  it('should compile script with Vue API mapping', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');

    createFile('src/pages/index/index.vue', `
<template><div>{{ count }}</div></template>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
`);

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    const js = readFileSync(join(outputDir, 'pages/index/index.js'), 'utf-8');
    expect(js).toContain('__dualler_ref');
    expect(js).toContain('dualler://runtime');
  });

  it('should compile style with rpx conversion', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');

    createFile('src/pages/index/index.vue', `
<template><div/></template>
<script setup></script>
<style scoped>
.container { padding: 20rpx; }
</style>
`);

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    const css = readFileSync(join(outputDir, 'pages/index/index.css'), 'utf-8');
    expect(css).toContain('vw');
    expect(css).not.toContain('rpx');
  });

  it('should generate correct manifest', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');
    createFile('src/pages/index/index.vue', '<template><div/></template><script setup></script>');

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    expect(result.manifest.appId).toBe('com.test.app');
    expect(result.manifest.compilerVersion).toBe('2.0.0');
    expect(result.manifest.pages).toEqual(['pages/index/index']);
    expect(result.manifest.totalSize).toBeGreaterThan(0);
    expect(result.manifest.buildTime).toBeTruthy();
    expect(result.manifest.pageRoutes).toHaveProperty('pages/index/index');
  });

  it('should handle multiple pages', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');
    createFile('src/pages/index/index.vue', '<template><div/></template><script setup></script>');
    createFile('src/pages/detail/detail.vue', '<template><div/></template><script setup></script>');

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/index/index', 'src/pages/detail/detail'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    expect(result.manifest.pages).toHaveLength(2);
    expect(existsSync(join(outputDir, 'pages/index/index.html'))).toBe(true);
    expect(existsSync(join(outputDir, 'pages/detail/detail.html'))).toBe(true);
  });

  it('should generate warnings for missing pages', async () => {
    createFile('src/app.vue', '<template><div/></template>\n<script setup></script>');

    const result = await bundle({
      appId: 'com.test.app',
      entry: join(srcDir, 'app.vue'),
      pages: ['src/pages/missing/missing'],
      components: [],
      outputDir,
      projectRoot: testDir,
      srcDir: 'src',
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('not found');
  });
});
