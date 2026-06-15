import postcss from 'postcss';

export interface CompileStyleOptions {
  scoped?: boolean;
  id?: string;
  minify?: boolean;
  designWidth?: number;
}

export async function compileStyle(
  source: string,
  options: CompileStyleOptions = {}
): Promise<string> {
  const { scoped = true, id = 'default', minify = true } = options;

  const plugins: postcss.AcceptedPlugin[] = [
    rpxToPxPlugin(),
    ...(scoped ? [scopedPlugin(id)] : []),
  ];

  const result = await postcss(plugins).process(source, {
    from: undefined,
    map: false,
  });

  return result.css;
}

function rpxToPxPlugin(): postcss.Plugin {
  return {
    postcssPlugin: 'dualler-rpx-to-vw',
    Declaration(decl) {
      if (decl.value.includes('rpx')) {
        decl.value = decl.value.replace(
          /(\d+(?:\.\d+)?)rpx/g,
          (_, num) => `${(parseFloat(num) / 750 * 100).toFixed(4)}vw`
        );
      }
    },
  };
}
rpxToPxPlugin.postcss = true;

function scopedPlugin(id: string): postcss.Plugin {
  return {
    postcssPlugin: 'dualler-scoped',
    Rule(rule) {
      const scopeAttr = `[data-v-${id}]`;
      rule.selector = rule.selector.replace(/([^,]+)/g, (match) => {
        const trimmed = match.trim();
        if (trimmed.startsWith(':') || trimmed.startsWith('::')) return match;
        return `${match}${scopeAttr}`;
      });
    },
  };
}
scopedPlugin.postcss = true;
