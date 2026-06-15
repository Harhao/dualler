import { AccessLog } from './entities/access-log.entity';
export declare class StatisticsService {
    private accessLogs;
    private idCounter;
    logAccess(appId: string, version: string, platform: string, ip: string, userAgent: string): AccessLog;
    findByAppId(appId: string, page?: number, pageSize?: number): {
        items: AccessLog[];
        total: number;
        page: number;
        pageSize: number;
    };
    getStats(appId: string, startDate: Date, endDate: Date): {
        appId: string;
        startDate: Date;
        endDate: Date;
        totalAccess: number;
        byPlatform: Record<string, number>;
        byVersion: Record<string, number>;
    };
}
