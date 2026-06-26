import { describe, it, expect } from 'vitest';
import { compileScript } from '../script-compiler';

describe('script-compiler', () => {
  describe('compileScript', () => {
    it('should rewrite Vue imports to Dualler runtime', () => {
      const source = `import { ref, reactive } from 'vue'`;

      const result = compileScript(source);

      expect(result.code).toContain('dualler://runtime');
      expect(result.code).toContain('__dualler_ref');
      expect(result.code).toContain('__dualler_reactive');
      expect(result.code).not.toContain("from 'vue'");
    });

    it('should rewrite Vue API calls', () => {
      const source = `
import { ref, computed, watch } from 'vue'
const count = ref(0)
const double = computed(() => count.value * 2)
watch(count, (val) => console.log(val))
`;

      const result = compileScript(source);

      expect(result.code).toContain('__dualler_ref(0)');
      expect(result.code).toContain('__dualler_computed(');
      expect(result.code).toContain('__dualler_watch(');
    });

    it('should map lifecycle hooks', () => {
      const source = `
import { onMounted, onUnmounted, onActivated } from 'vue'
onMounted(() => console.log('mounted'))
onUnmounted(() => console.log('unmounted'))
onActivated(() => console.log('activated'))
`;

      const result = compileScript(source);

      expect(result.code).toContain('__dualler_onReady');
      expect(result.code).toContain('__dualler_onUnload');
      expect(result.code).toContain('__dualler_onShow');
    });

    it('should detect reactive variables', () => {
      const source = `
import { ref, reactive } from 'vue'
const count = ref(0)
const state = reactive({ name: 'test' })
const notReactive = 'just a string'
`;

      const result = compileScript(source);

      expect(result.reactiveVars).toContain('count');
      expect(result.reactiveVars).toContain('state');
      expect(result.reactiveVars).not.toContain('notReactive');
    });

    it('should detect imports', () => {
      const source = `
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
`;

      const result = compileScript(source);

      expect(result.imports.has('vue')).toBe(true);
      expect(result.imports.get('vue')).toContain('ref');
      expect(result.imports.get('vue')).toContain('computed');
    });

    it('should handle TypeScript syntax', () => {
      const source = `
import { ref } from 'vue'
const count = ref<number>(0)
const name = ref<string>('test')
`;

      const result = compileScript(source, { filename: 'test.ts' });

      expect(result.code).toContain('__dualler_ref');
    });

    it('should handle defineProps in script setup', () => {
      const source = `
const props = defineProps({
  label: { type: String, default: 'Label' },
  count: { type: Number, default: 0 }
})
`;

      const result = compileScript(source, { isSetup: true });

      expect(result.code).toContain('__dualler_defineProps');
    });

    it('should handle defineEmits in script setup', () => {
      const source = `
const emit = defineEmits(['update', 'change'])
`;

      const result = compileScript(source, { isSetup: true });

      expect(result.code).toContain('__dualler_defineEmits');
    });

    it('should generate Page wrapper when wrapAsPage is true', () => {
      const source = `
import { ref } from 'vue'
const count = ref(0)
function increment() { count.value++ }
`;

      const result = compileScript(source, {
        wrapAsPage: true,
        componentName: 'Index',
        templateReactiveDeps: ['count'],
      });

      expect(result.code).toContain('Page(');
      expect(result.code).toContain('onLoad');
      expect(result.code).toContain('onReady');
      expect(result.code).toContain('onShow');
      expect(result.code).toContain('onHide');
      expect(result.code).toContain('onUnload');
    });

    it('should generate Component wrapper when wrapAsComponent is true', () => {
      const source = `
import { ref } from 'vue'
const count = ref(0)
`;

      const result = compileScript(source, {
        wrapAsComponent: true,
        componentName: 'MyButton',
      });

      expect(result.code).toContain('Component(');
      expect(result.code).toContain('properties');
      expect(result.code).toContain('methods');
      expect(result.code).toContain('lifetimes');
    });

    it('should preserve non-Vue imports', () => {
      const source = `
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
`;

      const result = compileScript(source);

      expect(result.code).toContain("from 'vue-router'");
      expect(result.code).toContain("from 'axios'");
    });

    it('should handle complex reactive expressions', () => {
      const source = `
import { ref, computed } from 'vue'
const items = ref([])
const filtered = computed(() => items.value.filter(i => i.active))
`;

      const result = compileScript(source);

      expect(result.reactiveVars).toContain('items');
      expect(result.reactiveVars).toContain('filtered');
    });
  });
});
