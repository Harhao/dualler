"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let ReleaseService = class ReleaseService {
    constructor() {
        this.releases = [];
        this.idCounter = 1;
    }
    create(appId, packageId, version, grayConfig) {
        if (grayConfig && (grayConfig.percentage < 0 || grayConfig.percentage > 100)) {
            throw new common_1.ForbiddenException(shared_1.ErrorCode.GRAY_CONFIG_INVALID, 'Invalid gray config');
        }
        const release = {
            id: String(this.idCounter++),
            appId,
            packageId,
            version,
            grayConfig,
            status: 'pending',
            createdAt: new Date(),
        };
        this.releases.push(release);
        return release;
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        const filtered = this.releases.filter(r => r.appId === appId);
        const start = (page - 1) * pageSize;
        return {
            items: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
        };
    }
    findById(id) {
        const release = this.releases.find(r => r.id === id);
        if (!release)
            throw new common_1.NotFoundException(shared_1.ErrorCode.VERSION_NOT_FOUND, 'Release not found');
        return release;
    }
    activate(id) {
        const release = this.findById(id);
        release.status = 'active';
        return release;
    }
    rollback(id) {
        const release = this.findById(id);
        release.status = 'rollback';
        return release;
    }
};
exports.ReleaseService = ReleaseService;
exports.ReleaseService = ReleaseService = __decorate([
    (0, common_1.Injectable)()
], ReleaseService);
//# sourceMappingURL=release.service.js.map