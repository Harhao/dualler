export interface PackageInfo {
    appId: string;
    version: string;
    baseVersion: string;
    packageSize: number;
    sha256: string;
    downloadUrl: string;
    patchUrl: string | null;
    patchBaseVersion: string | null;
    patchSha256: string | null;
    forceUpdate: boolean;
    minSupportVersion: string;
    releaseNote: string;
}
export interface UpdateCheckResponse {
    needUpdate: boolean;
    packageInfo: PackageInfo | null;
}
export interface UploadPackageRequest {
    appId: string;
    version: string;
    releaseNote: string;
}
export interface GrayStrategy {
    type: 'percentage' | 'region' | 'userWhitelist' | 'device' | 'combined';
    config: Record<string, any>;
}
export interface GrayReleaseConfig {
    packageId: string;
    strategy: GrayStrategy;
    enabled: boolean;
}
//# sourceMappingURL=package.d.ts.map