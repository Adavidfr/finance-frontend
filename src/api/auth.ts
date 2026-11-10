import { apiClient } from "./client";
import type {
  LoginCredentials,
  RegisterData,
  TokenResponse,
} from "../types/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/token/", credentials);
  return response.data;
}

export async function register(data: RegisterData): Promise<void> {
  await apiClient.post("/auth/register/", data);
}

export function saveTokens(tokens: TokenResponse) {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No hay refresh token disponible");
  }

  const response = await apiClient.post<{ access: string }>("/token/refresh/", {
    refresh: refreshToken,
  });

  localStorage.setItem("access_token", response.data.access);
  return response.data.access;
}
