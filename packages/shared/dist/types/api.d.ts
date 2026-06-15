export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}
export interface PaginationRequest {
    page: number;
    pageSize: number;
}
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface StatisticsOverview {
    dau: number;
    uv: number;
    downloadCount: number;
    versionDistribution: Record<string, number>;
}
//# sourceMappingURL=api.d.ts.map