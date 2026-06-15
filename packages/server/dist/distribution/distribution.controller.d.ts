import { DistributionService } from './distribution.service';
export declare class DistributionController {
    private readonly distributionService;
    constructor(distributionService: DistributionService);
    create(dto: {
        appId: string;
        version: string;
        platform: 'android' | 'ios' | 'web';
        downloadUrl: string;
    }): import("./distribution.service").Distribution;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: import("./distribution.service").Distribution[];
        total: number;
        page: number;
        pageSize: number;
    };
    findOne(id: string): import("./distribution.service").Distribution;
}
