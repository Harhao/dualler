export interface Release {
    id: string;
    appId: string;
    packageId: string;
    version: string;
    grayConfig?: {
        percentage: number;
        userWhitelist: string[];
    };
    status: 'pending' | 'active' | 'rollback';
    createdAt: Date;
}
export declare class ReleaseService {
    private releases;
    private idCounter;
    create(appId: string, packageId: string, version: string, grayConfig?: {
        percentage: number;
        userWhitelist: string[];
    }): Release;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: Release[];
        total: number;
        page: number;
        pageSize: number;
    };
    findById(id: string): Release;
    activate(id: string): Release;
    rollback(id: string): Release;
}
