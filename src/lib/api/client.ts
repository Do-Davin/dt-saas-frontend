// Framework-agnostic API client (Axios).
//
// Used by both public catalog code (no auth) and the future owner dashboard
// (auth header attached by the caller via the owner module). This file MUST
// NOT know about owner tokens, login state, or any feature-specific concept.

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

const DEFAULT_BASE_URL = "http://localhost:3000/api";

function getBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_BASE_URL;
  return base.replace(/\/+$/, "");
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function extractErrorMessage(
  data: unknown,
  status: number,
  fallback: string
): string {
  if (isPlainObject(data)) {
    const candidate = data.message ?? data.error;
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  if (typeof data === "string" && data.length > 0) return data;
  return fallback || `Request failed (${status})`;
}

// Convert any thrown value from Axios into a typed ApiError so callers only
// ever need to catch one error type. status === 0 means the request never
// reached the server (network, DNS, CORS preflight, timeout).
function normalizeAxiosError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<unknown>;
    if (axErr.response) {
      const { status, data } = axErr.response;
      const message = extractErrorMessage(data, status, axErr.message);
      const details = isPlainObject(data) ? data : undefined;
      return new ApiError(status, message, details);
    }
    return new ApiError(0, axErr.message || "Network error");
  }
  if (err instanceof Error) return new ApiError(0, err.message);
  return new ApiError(0, "Unknown error");
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    // Axios sets Content-Type automatically when the body is a plain object,
    // so we only need to opt into JSON responses by default.
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeAxiosError(error))
);

// Thin convenience over apiClient.request — returns the response body directly
// and rethrows the normalized ApiError. For anything more (cancellation,
// upload progress, response headers), use apiClient directly.
export async function apiFetch<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
