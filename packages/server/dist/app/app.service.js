"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let AppService = class AppService {
    constructor() {
        this.apps = [];
        this.idCounter = 1;
    }
    create(dto, ownerId) {
        const app = {
            id: String(this.idCounter++),
            appId: dto.appId,
            appName: dto.appName,
            description: dto.description || '',
            ownerId,
            status: 'draft',
            createdAt: new Date(),
        };
        this.apps.push(app);
        return app;
    }
    findAll(page = 1, pageSize = 10) {
        const start = (page - 1) * pageSize;
        return {
            items: this.apps.slice(start, start + pageSize),
            total: this.apps.length,
            page,
            pageSize,
        };
    }
    findById(id) {
        const app = this.apps.find(a => a.id === id);
        if (!app)
            throw new common_1.NotFoundException(shared_1.ErrorCode.APP_NOT_FOUND, 'App not found');
        return app;
    }
    update(id, dto) {
        const app = this.findById(id);
        Object.assign(app, dto);
        return app;
    }
    delete(id) {
        const index = this.apps.findIndex(a => a.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(shared_1.ErrorCode.APP_NOT_FOUND);
        this.apps.splice(index, 1);
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map