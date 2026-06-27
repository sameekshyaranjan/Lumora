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

export const progressApi = {
  get: (category) => unwrap(client.get(`/progress/${category}`)),
  markCompleted: (videoId, category) => unwrap(client.post(`/progress/${videoId}`, { category })),
  stats: () => unwrap(client.get('/progress/stats')),
};

export const quizApi = {
  getQuiz: (videoId) => unwrap(client.get(`/videos/${videoId}/quiz`)),
  submitQuiz: (videoId, score) => unwrap(client.post(`/videos/${videoId}/quiz/submit`, { score })),
};

export const timestampApi = {
  saveTimestamp: (videoId, timestamp, note) => unwrap(client.post(`/videos/${videoId}/timestamps`, { timestamp, note })),
  getVideoTimestamps: (videoId) => unwrap(client.get(`/videos/${videoId}/timestamps`)),
  getAllTimestamps: () => unwrap(client.get('/bookmarks/timestamps')),
};
