import axios from 'axios';

let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;

    if (is401 && !original._retried && !original.url.includes('/auth/refresh')) {
      original._retried = true;
      try {
        refreshing = refreshing || client.post('/auth/refresh');
        const { data } = await refreshing;
        refreshing = null;
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        window.dispatchEvent(new CustomEvent('token-refreshed', { detail: newToken }));
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (e) {
        refreshing = null;
        window.dispatchEvent(new CustomEvent('auth-expired'));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
