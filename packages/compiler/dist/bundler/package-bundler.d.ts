export interface BundleOptions {
    appId: string;
    entry: string;
    pages: string[];
    components: string[];
    outputDir: string;
    minify?: boolean;
    sourceMap?: boolean;
}
export interface BundleResult {
    files: Map<string, FileInfo>;
    manifest: Manifest;
}
export interface FileInfo {
    path: string;
    sha256: string;
    size: number;
}
export interface Manifest {
    appId: string;
    version: string;
    compilerVersion: string;
    pages: string[];
    components: string[];
    files: Record<string, FileInfo>;
    totalSize: number;
    buildTime: string;
}
export declare function bundle(options: BundleOptions): Promise<BundleResult>;
