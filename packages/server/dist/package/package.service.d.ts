import { Package, Patch } from './entities/package.entity';
export declare class PackageService {
    private packages;
    private patches;
    private idCounter;
    upload(appId: string, version: string, releaseNote: string, file: {
        size: number;
        buffer: Buffer;
    }): Package;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: Package[];
        total: number;
        page: number;
        pageSize: number;
    };
    findById(id: string): Package;
    publish(packageId: string): Package;
    unpublish(packageId: string): Package;
    findPatch(appId: string, baseVersion: string, targetVersion: string): Patch | undefined;
    private generatePatchAsync;
}
