"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const app_module_1 = require("./app/app.module");
const package_module_1 = require("./package/package.module");
const release_module_1 = require("./release/release.module");
const distribution_module_1 = require("./distribution/distribution.module");
const storage_module_1 = require("./storage/storage.module");
const cdn_module_1 = require("./cdn/cdn.module");
const statistics_module_1 = require("./statistics/statistics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            app_module_1.AppModule,
            package_module_1.PackageModule,
            release_module_1.ReleaseModule,
            distribution_module_1.DistributionModule,
            storage_module_1.StorageModule,
            cdn_module_1.CdnModule,
            statistics_module_1.StatisticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map