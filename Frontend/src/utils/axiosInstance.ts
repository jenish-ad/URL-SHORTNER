import axios from "axios";

export const API_URL: string = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? (error.response?.data?.message ?? error.message)
      : "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
