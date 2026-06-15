export declare const API_PATHS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly REFRESH: "/auth/refresh";
    };
    readonly USERS: {
        readonly LIST: "/users";
        readonly DETAIL: (id: string) => string;
    };
    readonly APPS: {
        readonly LIST: "/apps";
        readonly CREATE: "/apps";
        readonly DETAIL: (id: string) => string;
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
    };
    readonly PACKAGES: {
        readonly UPLOAD: "/packages/upload";
        readonly LIST: "/packages";
        readonly PUBLISH: (id: string) => string;
        readonly UNPUBLISH: (id: string) => string;
        readonly GRAY: (id: string) => string;
        readonly CHECK: (appId: string) => string;
    };
    readonly STATISTICS: {
        readonly OVERVIEW: "/statistics/overview";
        readonly DETAIL: "/statistics/detail";
    };
};
//# sourceMappingURL=api-paths.d.ts.map