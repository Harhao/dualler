export interface Distribution {
    id: string;
    appId: string;
    version: string;
    platform: 'android' | 'ios' | 'web';
    downloadUrl: string;
    qrCodeUrl: string;
    createdAt: Date;
}
export declare class DistributionService {
    private distributions;
    private idCounter;
    create(appId: string, version: string, platform: 'android' | 'ios' | 'web', downloadUrl: string): Distribution;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: Distribution[];
        total: number;
        page: number;
        pageSize: number;
    };
    findById(id: string): Distribution;
}
