// Owner-gated API fetch helper.
//
// Wraps the shared apiFetch with two owner-specific behaviors:
//
//   1. JWT injection — owner Authorization header added per-request via
//      withOwnerAuthHeaders(). The shared apiClient stays unmodified and
//      public catalog calls are unaffected.
//
//   2. 401 auto-logout — clears the stored owner token and redirects to
//      /owner/login so owners are not stranded on a broken error state when
//      their session has expired or been revoked server-side.
//
// PUBLIC CATALOG CODE MUST NOT IMPORT THIS FUNCTION.
// Only files inside src/features/owner/ should call it.

import type { AxiosRequestConfig } from "axios";
import { ApiError, apiFetch } from "@/lib/api/client";
import { clearOwnerToken, withOwnerAuthHeaders } from "../_auth/ownerToken";

export async function ownerApiFetch<T>(config: AxiosRequestConfig): Promise<T> {
  const mergedHeaders = withOwnerAuthHeaders(
    (config.headers ?? {}) as Record<string, string>
  );
  try {
    return await apiFetch<T>({ ...config, headers: mergedHeaders });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearOwnerToken();
      if (typeof window !== "undefined") {
        window.location.replace("/owner/login");
      }
    }
    throw err;
  }
}
