import request from './request';

export const appApi = {
  getList(params?: { page?: number; pageSize?: number }) {
    return request.get('/apps', { params });
  },
  getDetail(id: string) {
    return request.get(`/apps/${id}`);
  },
  create(data: { appId: string; appName: string; description?: string }) {
    return request.post('/apps', data);
  },
  update(id: string, data: any) {
    return request.put(`/apps/${id}`, data);
  },
  delete(id: string) {
    return request.delete(`/apps/${id}`);
  },
};
