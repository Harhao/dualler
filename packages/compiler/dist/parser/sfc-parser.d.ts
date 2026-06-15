import { SFCDescriptor } from '@vue/compiler-sfc';
export interface SFCLangInfo {
    templateLang: string;
    scriptLang: string;
    styleLang: string;
}
export interface SFCParseResult {
    descriptor: SFCDescriptor;
    langInfo: SFCLangInfo;
}
export declare function parseSFC(source: string, filename: string): SFCParseResult;
export declare function isDuallerComponent(tag: string): boolean;
