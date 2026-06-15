export interface CompileTemplateResult {
    code: string;
    deps: string[];
    nativeComponents: string[];
}
export declare function compileTemplate(template: string): CompileTemplateResult;
