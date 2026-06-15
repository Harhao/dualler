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
exports.DistributionController = void 0;
const common_1 = require("@nestjs/common");
const distribution_service_1 = require("./distribution.service");
let DistributionController = class DistributionController {
    constructor(distributionService) {
        this.distributionService = distributionService;
    }
    create(dto) {
        return this.distributionService.create(dto.appId, dto.version, dto.platform, dto.downloadUrl);
    }
    findByAppId(appId, page = 1, pageSize = 10) {
        return this.distributionService.findByAppId(appId, +page, +pageSize);
    }
    findOne(id) {
        return this.distributionService.findById(id);
    }
};
exports.DistributionController = DistributionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DistributionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('appId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DistributionController.prototype, "findByAppId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistributionController.prototype, "findOne", null);
exports.DistributionController = DistributionController = __decorate([
    (0, common_1.Controller)('distributions'),
    __metadata("design:paramtypes", [distribution_service_1.DistributionService])
], DistributionController);
//# sourceMappingURL=distribution.controller.js.map