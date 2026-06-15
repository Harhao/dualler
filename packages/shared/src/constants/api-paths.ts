export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },
  APPS: {
    LIST: '/apps',
    CREATE: '/apps',
    DETAIL: (id: string) => `/apps/${id}`,
    UPDATE: (id: string) => `/apps/${id}`,
    DELETE: (id: string) => `/apps/${id}`,
  },
  PACKAGES: {
    UPLOAD: '/packages/upload',
    LIST: '/packages',
    PUBLISH: (id: string) => `/packages/${id}/publish`,
    UNPUBLISH: (id: string) => `/packages/${id}/unpublish`,
    GRAY: (id: string) => `/packages/${id}/gray`,
    CHECK: (appId: string) => `/packages/${appId}/check`,
  },
  STATISTICS: {
    OVERVIEW: '/statistics/overview',
    DETAIL: '/statistics/detail',
  },
} as const;
