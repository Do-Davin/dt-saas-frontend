// Owner auth API — login only for now.
//
// Uses the shared apiFetch directly (NOT ownerApiFetch) because there is no
// token to attach at login time. Public catalog code must not import this file.
//
// TODO(spring-boot): confirm the exact POST /auth/login response shape after
// backend migration. extractToken() handles all observed NestJS variants and
// the most common Spring Boot variants; update the OwnerLoginResponse type
// and extractToken once the shape is pinned.

import { apiFetch } from "@/lib/api/client";

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

// Intentionally permissive — all fields optional so a shape change does not
// cause a TypeScript error at the call site before we pin the contract.
interface OwnerLoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  data?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
  };
}

function extractToken(body: OwnerLoginResponse): string | null {
  return (
    body.token ??
    body.accessToken ??
    body.jwt ??
    body.data?.token ??
    body.data?.accessToken ??
    body.data?.jwt ??
    null
  );
}

// POST /auth/login. No Authorization header — there is no token yet.
// Resolves with the raw JWT string on success.
// Throws ApiError (HTTP / network errors from apiFetch) or Error if the
// response contains no recognizable token field.
export async function loginOwner(
  request: OwnerLoginRequest
): Promise<string> {
  const body = await apiFetch<OwnerLoginResponse>({
    method: "POST",
    url: "/auth/login",
    data: request,
  });
  const token = extractToken(body);
  if (!token) {
    throw new Error(
      "Login succeeded but no token was returned by the backend."
    );
  }
  return token;
}
