export interface CompileStyleOptions {
    scoped?: boolean;
    id?: string;
    minify?: boolean;
    designWidth?: number;
}
export declare function compileStyle(source: string, options?: CompileStyleOptions): Promise<string>;
