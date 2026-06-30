export interface SFCBlock {
  type: 'script' | 'template' | 'style';
  content: string;
  attrs: Record<string, string | boolean>;
}

export interface SFCParseResult {
  descriptor: {
    source: string;
    template?: { content: string; attrs: Record<string, string | boolean> };
    scripts?: Array<{ content: string; attrs: Record<string, string | boolean> }>;
    styles?: Array<{ content: string; attrs: Record<string, string | boolean>; modules?: boolean }>;
    customBlocks?: Array<{ type: string; content: string; attrs: Record<string, string | boolean> }>;
  };
}

export interface DSLNode {
  tag: string;
  props: Array<{ name: string; value: string | boolean | Record<string, any> }>;
  children: DSLNode[];
  events?: Record<string, string>;
  key?: string;
}

export interface CompileResult {
  dsl: DSLNode;
  css: string;
  logic: string;
}

export interface CompileOptions {
  filename: string;
  source: string;
  compilerOptions?: Record<string, any>;
}
