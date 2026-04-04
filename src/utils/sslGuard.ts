import axios from "axios";

let sslErrorListener: (() => void) | null = null;

export const registerSSLErrorHandler = (fn: () => void) => {
  sslErrorListener = fn;
};

export const setupSSLInterceptor = () => {
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const msg = error?.message || "";

      const isSSLError =
        msg.includes("SSL") ||
        msg.includes("certificate") ||
        msg.includes("ERR_CERT") ||
        msg.includes("Network Error");

      if (isSSLError && sslErrorListener) {
        sslErrorListener();
      }

      return Promise.reject(error);
    },
  );
};
