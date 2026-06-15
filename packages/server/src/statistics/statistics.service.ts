import { Injectable } from '@nestjs/common';
import { AccessLog } from './entities/access-log.entity';

@Injectable()
export class StatisticsService {
  private accessLogs: AccessLog[] = [];
  private idCounter = 1;

  logAccess(appId: string, version: string, platform: string, ip: string, userAgent: string) {
    const log: AccessLog = {
      id: String(this.idCounter++),
      appId,
      version,
      platform,
      ip,
      userAgent,
      accessedAt: new Date(),
    };
    this.accessLogs.push(log);
    return log;
  }

  findByAppId(appId: string, page = 1, pageSize = 10) {
    const filtered = this.accessLogs.filter(l => l.appId === appId);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  getStats(appId: string, startDate: Date, endDate: Date) {
    const filtered = this.accessLogs.filter(l =>
      l.appId === appId &&
      l.accessedAt >= startDate &&
      l.accessedAt <= endDate
    );

    const byPlatform = filtered.reduce((acc, log) => {
      acc[log.platform] = (acc[log.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byVersion = filtered.reduce((acc, log) => {
      acc[log.version] = (acc[log.version] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      appId,
      startDate,
      endDate,
      totalAccess: filtered.length,
      byPlatform,
      byVersion,
    };
  }
}
