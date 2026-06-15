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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@dualler/shared");
let AuthService = class AuthService {
    constructor() {
        this.users = new Map();
        this.users.set('admin', {
            id: '1',
            username: 'admin',
            passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
            role: 'admin',
        });
    }
    async login(username, password) {
        const user = this.users.get(username);
        if (!user) {
            throw new common_1.UnauthorizedException(shared_1.ErrorCode.AUTH_FAILED, 'Invalid credentials');
        }
        return {
            token: 'jwt-token-' + user.id,
            user: { id: user.id, username: user.username, role: user.role },
        };
    }
    async validateUser(userId) {
        for (const user of this.users.values()) {
            if (user.id === userId)
                return user;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthService);
//# sourceMappingURL=auth.service.js.map