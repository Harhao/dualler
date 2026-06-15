"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let PackageService = class PackageService {
    constructor() {
        this.packages = [];
        this.patches = [];
        this.idCounter = 1;
    }
    upload(appId, version, releaseNote, file) {
        if (file.size > 20 * 1024 * 1024) {
            throw new common_1.BadRequestException(shared_1.ErrorCode.PACKAGE_TOO_LARGE, 'Package exceeds 20MB');
        }
        const pkg = {
            id: String(this.idCounter++),
            appId,
            version,
            releaseNote,
            packageSize: file.size,
            sha256: 'sha256-placeholder',
            downloadUrl: `https://cdn.example.com/packages/${appId}/${version}.mpkg`,
            status: 'draft',
            forceUpdate: false,
            publishedAt: null,
            createdAt: new Date(),
        };
        this.packages.push(pkg);
        this.generatePatchAsync(appId, version);
        return pkg;
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        const filtered = this.packages.filter(p => p.appId === appId);
        const start = (page - 1) * pageSize;
        return {
            items: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
        };
    }
    findById(id) {
        const pkg = this.packages.find(p => p.id === id);
        if (!pkg)
            throw new common_1.NotFoundException(shared_1.ErrorCode.VERSION_NOT_FOUND, 'Package not found');
        return pkg;
    }
    publish(packageId) {
        const pkg = this.findById(packageId);
        pkg.status = 'published';
        pkg.publishedAt = new Date();
        return pkg;
    }
    unpublish(packageId) {
        const pkg = this.findById(packageId);
        pkg.status = 'unpublished';
        return pkg;
    }
    findPatch(appId, baseVersion, targetVersion) {
        return this.patches.find(p => p.appId === appId && p.baseVersion === baseVersion && p.targetVersion === targetVersion);
    }
    generatePatchAsync(appId, newVersion) {
        const prevPkg = this.packages
            .filter(p => p.appId === appId && p.status === 'published')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (prevPkg) {
            this.patches.push({
                id: String(this.idCounter++),
                appId,
                baseVersion: prevPkg.version,
                targetVersion: newVersion,
                patchSize: 0,
                sha256: 'patch-sha256',
                downloadUrl: `https://cdn.example.com/patches/${appId}/${prevPkg.version}-${newVersion}.patch`,
                createdAt: new Date(),
            });
        }
    }
};
exports.PackageService = PackageService;
exports.PackageService = PackageService = __decorate([
    (0, common_1.Injectable)()
], PackageService);
//# sourceMappingURL=package.service.js.map