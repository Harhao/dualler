import { PackageService } from './package.service';
export declare class PackageController {
    private readonly packageService;
    constructor(packageService: PackageService);
    upload(dto: {
        appId: string;
        version: string;
        releaseNote: string;
    }): import("./entities/package.entity").Package;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: import("./entities/package.entity").Package[];
        total: number;
        page: number;
        pageSize: number;
    };
    findOne(id: string): import("./entities/package.entity").Package;
    publish(id: string): import("./entities/package.entity").Package;
    unpublish(id: string): import("./entities/package.entity").Package;
    checkUpdate(appId: string, version: string): {
        needUpdate: boolean;
        packageInfo: null;
    } | {
        needUpdate: boolean;
        packageInfo: import("./entities/package.entity").Package;
    };
}
