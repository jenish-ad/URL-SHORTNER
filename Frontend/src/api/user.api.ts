import axiosInstance from "../utils/axiosInstance";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface ShortUrl {
  _id: string;
  full_url: string;
  short_url: string;
  clicks: number;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> =>
  (await axiosInstance.post<AuthResponse>("/api/auth/login", { email, password })).data;

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> =>
  (
    await axiosInstance.post<AuthResponse>("/api/auth/register", {
      name,
      email,
      password,
    })
  ).data;

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post("/api/auth/logout");
};

export const getCurrentUser = async (): Promise<AuthResponse> =>
  (await axiosInstance.get<AuthResponse>("/api/auth/me")).data;

export const getAllUserUrls = async (): Promise<{ urls: ShortUrl[] }> =>
  (await axiosInstance.post<{ urls: ShortUrl[] }>("/api/user/urls")).data;
