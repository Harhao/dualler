"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let DistributionService = class DistributionService {
    constructor() {
        this.distributions = [];
        this.idCounter = 1;
    }
    create(appId, version, platform, downloadUrl) {
        const distribution = {
            id: String(this.idCounter++),
            appId,
            version,
            platform,
            downloadUrl,
            qrCodeUrl: `https://api.example.com/qr/${appId}/${version}/${platform}`,
            createdAt: new Date(),
        };
        this.distributions.push(distribution);
        return distribution;
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        const filtered = this.distributions.filter(d => d.appId === appId);
        const start = (page - 1) * pageSize;
        return {
            items: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
        };
    }
    findById(id) {
        const distribution = this.distributions.find(d => d.id === id);
        if (!distribution)
            throw new common_1.NotFoundException(shared_1.ErrorCode.NOT_FOUND, 'Distribution not found');
        return distribution;
    }
};
exports.DistributionService = DistributionService;
exports.DistributionService = DistributionService = __decorate([
    (0, common_1.Injectable)()
], DistributionService);
//# sourceMappingURL=distribution.service.js.map