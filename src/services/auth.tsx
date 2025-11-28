import axios from 'axios';

const BASE_URL = import.meta.env.VITE_AUTH_BASE || 'http://localhost:8001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Простые ключи в localStorage
const TOKEN_KEY = 'access_token';

let refreshingPromise: Promise<string | null> | null = null;

// helper: получить токен из localStorage
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

// функция, которая вызывает endpoint refresh и обновляет storage
async function refreshToken(): Promise<string | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const resp = await axios.get(`${BASE_URL}/auth/tokens/refresh`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const newToken = resp.data?.token || resp.data?.accessToken || null;
    if (newToken) setStoredToken(newToken);
    return newToken;
  } catch (err) {
    // если refresh не удался — очистим
    setStoredToken(null);
    return null;
  }
}

// request interceptor: перед запросом проверяем токен и, если скоро истечёт, обновляем
api.interceptors.request.use(async (config) => {
  const token = getStoredToken();
  if (!token) return config;

  // легкий парсер exp из jwt (base64url)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const exp = payload.exp as number | undefined; // seconds
      const nowSec = Math.floor(Date.now() / 1000);
      const refreshBefore = 60; // секунд до истечения — триггерим refresh

      if (exp && exp - nowSec < refreshBefore) {
        // только один параллельный refresh
        if (!refreshingPromise) {
          refreshingPromise = refreshToken().finally(() => { refreshingPromise = null; });
        }
        const newToken = await refreshingPromise;
        if (newToken) {
          config.headers = config.headers ?? {};
          config.headers['Authorization'] = `Bearer ${newToken}`;
          return config;
        } else {
          // refresh failed -> continue without token (backend will 401)
          return config;
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  config.headers = config.headers ?? {};
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// response interceptor: при 401 — пробуем один раз обновить и повторить
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!refreshingPromise) refreshingPromise = refreshToken().finally(() => { refreshingPromise = null; });
      const newToken = await refreshingPromise;
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
