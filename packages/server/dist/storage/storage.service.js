"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let StorageService = class StorageService {
    async upload(file) {
        if (file.size > 50 * 1024 * 1024) {
            throw new common_1.BadRequestException(shared_1.ErrorCode.PACKAGE_TOO_LARGE, 'File exceeds 50MB');
        }
        const key = `uploads/${Date.now()}-${file.originalname}`;
        return {
            key,
            url: `https://storage.example.com/${key}`,
            size: file.size,
            contentType: file.mimetype,
        };
    }
    async getPresignedUrl(key) {
        return {
            url: `https://storage.example.com/${key}?expires=3600`,
            expiresAt: new Date(Date.now() + 3600000),
        };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
//# sourceMappingURL=storage.service.js.map