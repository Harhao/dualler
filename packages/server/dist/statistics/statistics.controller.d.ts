import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    logAccess(dto: {
        appId: string;
        version: string;
        platform: string;
        ip: string;
        userAgent: string;
    }): import("./entities/access-log.entity").AccessLog;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: import("./entities/access-log.entity").AccessLog[];
        total: number;
        page: number;
        pageSize: number;
    };
    getStats(appId: string, startDate: string, endDate: string): {
        appId: string;
        startDate: Date;
        endDate: Date;
        totalAccess: number;
        byPlatform: Record<string, number>;
        byVersion: Record<string, number>;
    };
}
