import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — silently refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // if we got a 401 and haven't already retried this request
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        const { data } = await axios.post(
          "http://localhost:8000/api/auth/refresh/",
          { refresh }
        );

        // store the new tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        document.cookie = `access_token=${data.access}; path=/; max-age=900`;

        // retry the original request with the new token
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (_) {
        // refresh token is also expired — clear everything and send to login
        localStorage.clear();
        document.cookie = "access_token=; path=/; max-age=0";
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;