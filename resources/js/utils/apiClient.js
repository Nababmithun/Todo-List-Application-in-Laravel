import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const code = err?.response?.status;
    if (code === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    // 403 => UI গুলো নিজে error দেখাবে (hard redirect নয়)
    throw err;
  }
);
