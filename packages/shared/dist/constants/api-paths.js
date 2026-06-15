"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_PATHS = void 0;
exports.API_PATHS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
    },
    USERS: {
        LIST: '/users',
        DETAIL: (id) => `/users/${id}`,
    },
    APPS: {
        LIST: '/apps',
        CREATE: '/apps',
        DETAIL: (id) => `/apps/${id}`,
        UPDATE: (id) => `/apps/${id}`,
        DELETE: (id) => `/apps/${id}`,
    },
    PACKAGES: {
        UPLOAD: '/packages/upload',
        LIST: '/packages',
        PUBLISH: (id) => `/packages/${id}/publish`,
        UNPUBLISH: (id) => `/packages/${id}/unpublish`,
        GRAY: (id) => `/packages/${id}/gray`,
        CHECK: (appId) => `/packages/${appId}/check`,
    },
    STATISTICS: {
        OVERVIEW: '/statistics/overview',
        DETAIL: '/statistics/detail',
    },
};
//# sourceMappingURL=api-paths.js.map