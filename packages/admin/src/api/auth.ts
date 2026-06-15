import request from './request';

export const authApi = {
  login(data: { username: string; password: string }) {
    return request.post('/auth/login', data);
  },
  register(data: { username: string; password: string }) {
    return request.post('/auth/register', data);
  },
};
