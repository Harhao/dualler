export declare class CdnService {
    purgeCache(urls: string[]): Promise<{
        success: boolean;
        purgedUrls: string[];
        purgedAt: Date;
    }>;
    getCacheStatus(url: string): Promise<{
        url: string;
        cached: boolean;
        cachedAt: Date;
        expiresAt: Date;
    }>;
    getStats(domain: string, startDate: Date, endDate: Date): Promise<{
        domain: string;
        startDate: Date;
        endDate: Date;
        totalRequests: number;
        totalTraffic: number;
        cacheHitRate: number;
    }>;
}
