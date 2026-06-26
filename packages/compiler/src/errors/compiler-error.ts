/**
 * Unified compiler error type with file location and suggestions
 */
export class CompilerError extends Error {
  constructor(
    message: string,
    public readonly file?: string,
    public readonly line?: number,
    public readonly column?: number,
    public readonly code?: string,
    public readonly suggestion?: string,
  ) {
    super(message);
    this.name = 'CompilerError';
  }

  toString(): string {
    const parts: string[] = [`${this.name}: ${this.message}`];
    if (this.file) {
      const loc = this.line ? `:${this.line}${this.column ? `:${this.column}` : ''}` : '';
      parts.push(`  at ${this.file}${loc}`);
    }
    if (this.suggestion) {
      parts.push(`  💡 ${this.suggestion}`);
    }
    return parts.join('\n');
  }
}

export class TemplateCompileError extends CompilerError {
  constructor(message: string, file?: string, line?: number, column?: number) {
    super(message, file, line, column, 'TEMPLATE_COMPILE_ERROR');
    this.name = 'TemplateCompileError';
  }
}

export class ScriptCompileError extends CompilerError {
  constructor(message: string, file?: string, line?: number, column?: number) {
    super(message, file, line, column, 'SCRIPT_COMPILE_ERROR');
    this.name = 'ScriptCompileError';
  }
}

export class StyleCompileError extends CompilerError {
  constructor(message: string, file?: string, line?: number, column?: number) {
    super(message, file, line, column, 'STYLE_COMPILE_ERROR');
    this.name = 'StyleCompileError';
  }
}

export class BundleError extends CompilerError {
  constructor(message: string, file?: string, suggestion?: string) {
    super(message, file, undefined, undefined, 'BUNDLE_ERROR', suggestion);
    this.name = 'BundleError';
  }
}
