import request from './request';

export const packageApi = {
  getList(appId: string, params?: { page?: number; pageSize?: number }) {
    return request.get('/packages', { params: { appId, ...params } });
  },
  upload(data: { appId: string; version: string; releaseNote: string }) {
    return request.post('/packages/upload', data);
  },
  publish(id: string) {
    return request.put(`/packages/${id}/publish`);
  },
  unpublish(id: string) {
    return request.put(`/packages/${id}/unpublish`);
  },
};
