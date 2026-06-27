// Thin wrappers that unwrap the { success, data, message } envelope so callers
// receive `data` directly. Errors bubble as axios errors (handled by callers).
import client from './client';

const unwrap = (p) => p.then((res) => res.data.data);

export const authApi = {
  register: (body) => unwrap(client.post('/auth/register', body)),
  login: (body) => unwrap(client.post('/auth/login', body)),
  me: () => unwrap(client.get('/auth/me')),
  refresh: () => unwrap(client.post('/auth/refresh')),
  logout: () => unwrap(client.post('/auth/logout')),
};

export const videoApi = {
  list: ({ cursor, limit = 5, category } = {}) =>
    unwrap(client.get('/videos', { params: { cursor, limit, category } })),
  get: (id) => unwrap(client.get(`/videos/${id}`)),
  like: (id) => unwrap(client.post(`/videos/${id}/like`)),
  unlike: (id) => unwrap(client.delete(`/videos/${id}/like`)),
  bookmark: (id) => unwrap(client.post(`/videos/${id}/bookmark`)),
  unbookmark: (id) => unwrap(client.delete(`/videos/${id}/bookmark`)),
  comment: (id, content) => unwrap(client.post(`/videos/${id}/comment`, { content })),
  comments: (id) => unwrap(client.get(`/videos/${id}/comments`)),
  bookmarks: () => unwrap(client.get('/bookmarks')),
};
