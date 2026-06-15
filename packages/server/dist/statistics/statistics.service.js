"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
let StatisticsService = class StatisticsService {
    constructor() {
        this.accessLogs = [];
        this.idCounter = 1;
    }
    logAccess(appId, version, platform, ip, userAgent) {
        const log = {
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
    findByAppId(appId, page = 1, pageSize = 10) {
        const filtered = this.accessLogs.filter(l => l.appId === appId);
        const start = (page - 1) * pageSize;
        return {
            items: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
        };
    }
    getStats(appId, startDate, endDate) {
        const filtered = this.accessLogs.filter(l => l.appId === appId &&
            l.accessedAt >= startDate &&
            l.accessedAt <= endDate);
        const byPlatform = filtered.reduce((acc, log) => {
            acc[log.platform] = (acc[log.platform] || 0) + 1;
            return acc;
        }, {});
        const byVersion = filtered.reduce((acc, log) => {
            acc[log.version] = (acc[log.version] || 0) + 1;
            return acc;
        }, {});
        return {
            appId,
            startDate,
            endDate,
            totalAccess: filtered.length,
            byPlatform,
            byVersion,
        };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)()
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map