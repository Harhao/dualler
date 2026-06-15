"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdnService = void 0;
const common_1 = require("@nestjs/common");
let CdnService = class CdnService {
    async purgeCache(urls) {
        return {
            success: true,
            purgedUrls: urls,
            purgedAt: new Date(),
        };
    }
    async getCacheStatus(url) {
        return {
            url,
            cached: true,
            cachedAt: new Date(),
            expiresAt: new Date(Date.now() + 86400000),
        };
    }
    async getStats(domain, startDate, endDate) {
        return {
            domain,
            startDate,
            endDate,
            totalRequests: 10000,
            totalTraffic: 1024 * 1024 * 100,
            cacheHitRate: 0.85,
        };
    }
};
exports.CdnService = CdnService;
exports.CdnService = CdnService = __decorate([
    (0, common_1.Injectable)()
], CdnService);
//# sourceMappingURL=cdn.service.js.map