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
exports.ReleaseController = void 0;
const common_1 = require("@nestjs/common");
const release_service_1 = require("./release.service");
let ReleaseController = class ReleaseController {
    constructor(releaseService) {
        this.releaseService = releaseService;
    }
    create(dto) {
        return this.releaseService.create(dto.appId, dto.packageId, dto.version, dto.grayConfig);
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        return this.releaseService.findByAppId(appId, +page, +pageSize);
    }
    findOne(id) {
        return this.releaseService.findById(id);
    }
    activate(id) {
        return this.releaseService.activate(id);
    }
    rollback(id) {
        return this.releaseService.rollback(id);
    }
};
exports.ReleaseController = ReleaseController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReleaseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('appId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ReleaseController.prototype, "findByAppId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReleaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReleaseController.prototype, "activate", null);
__decorate([
    (0, common_1.Put)(':id/rollback'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReleaseController.prototype, "rollback", null);
exports.ReleaseController = ReleaseController = __decorate([
    (0, common_1.Controller)('releases'),
    __metadata("design:paramtypes", [release_service_1.ReleaseService])
], ReleaseController);
//# sourceMappingURL=release.controller.js.map