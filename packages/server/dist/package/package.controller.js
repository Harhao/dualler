"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageController = void 0;
const common_1 = require("@nestjs/common");
const package_service_1 = require("./package.service");
let PackageController = class PackageController {
    constructor(packageService) {
        this.packageService = packageService;
    }
    upload(dto) {
        return this.packageService.upload(dto.appId, dto.version, dto.releaseNote, {
            size: 1024,
            buffer: Buffer.from(''),
        });
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        return this.packageService.findByAppId(appId, +page, +pageSize);
    }
    findOne(id) {
        return this.packageService.findById(id);
    }
    publish(id) {
        return this.packageService.publish(id);
    }
    unpublish(id) {
        return this.packageService.unpublish(id);
    }
    checkUpdate(appId, version) {
        const result = this.packageService.findByAppId(appId);
        const pkg = result.items[0];
        if (!pkg || pkg.version === version) {
            return { needUpdate: false, packageInfo: null };
        }
        return { needUpdate: true, packageInfo: pkg };
    }
};
exports.PackageController = PackageController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('appId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "findByAppId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "publish", null);
__decorate([
    (0, common_1.Put)(':id/unpublish'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Get)(':appId/check'),
    __param(0, (0, common_1.Param)('appId')),
    __param(1, (0, common_1.Query)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "checkUpdate", null);
exports.PackageController = PackageController = __decorate([
    (0, common_1.Controller)('packages'),
    __metadata("design:paramtypes", [package_service_1.PackageService])
], PackageController);
//# sourceMappingURL=package.controller.js.map