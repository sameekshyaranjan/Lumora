import axios from 'axios';

// In-memory access token. Redux setCredentials() keeps this in sync.
let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:5000
  withCredentials: true,                 // send the httpOnly refresh cookie
});

// Attach the Bearer access token to every request.
client.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// --- Silent refresh on 401 -------------------------------------------------
// If a request 401s, call /auth/refresh ONCE, store the new token, and retry
// the original request. Concurrent 401s share a single in-flight refresh.
let refreshing = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;

    // Don't try to refresh the refresh call itself, and only retry once.
    if (is401 && !original._retried && !original.url.includes('/auth/refresh')) {
      original._retried = true;
      try {
        refreshing = refreshing || client.post('/auth/refresh');
        const { data } = await refreshing;
        refreshing = null;
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        // Let the app sync Redux (see store subscription in Stage 3).
        window.dispatchEvent(new CustomEvent('token-refreshed', { detail: newToken }));
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (e) {
        refreshing = null;
        // Refresh failed -> session is truly over.
        window.dispatchEvent(new CustomEvent('auth-expired'));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
