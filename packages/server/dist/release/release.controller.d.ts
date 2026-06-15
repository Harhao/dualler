import { ReleaseService } from './release.service';
export declare class ReleaseController {
    private readonly releaseService;
    constructor(releaseService: ReleaseService);
    create(dto: {
        appId: string;
        packageId: string;
        version: string;
        grayConfig?: {
            percentage: number;
            userWhitelist: string[];
        };
    }): import("./release.service").Release;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: import("./release.service").Release[];
        total: number;
        page: number;
        pageSize: number;
    };
    findOne(id: string): import("./release.service").Release;
    activate(id: string): import("./release.service").Release;
    rollback(id: string): import("./release.service").Release;
}
