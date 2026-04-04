import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ❗ SSL / Network error
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error")
    ) {
      localStorage.setItem("SSL_UPDATING", "1");
    }

    return Promise.reject(error);
  },
);

export default api;
