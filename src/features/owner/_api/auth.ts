// Owner auth API.
// Public catalog code must not import this file.
//
// loginOwner      — POST /auth/login, no token required, uses apiFetch directly.
// getCurrentOwner — GET /auth/me, token required, uses ownerApiFetch.

import { apiFetch } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

// ─── Login ────────────────────────────────────────────────────────────────────

export interface OwnerLoginRequest {
  username: string;
  password: string;
}

// Confirmed Spring Boot shapes: { token } or { accessToken }.
// Nested { data: { token } } retained as a fallback in case the response is
// wrapped by a global envelope interceptor on the backend.
interface OwnerLoginResponse {
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
  };
}

function extractToken(body: OwnerLoginResponse): string | null {
  return (
    body.token ??
    body.accessToken ??
    body.data?.token ??
    body.data?.accessToken ??
    null
  );
}

// POST /auth/login. No Authorization header — there is no token yet.
// Resolves with the raw JWT string on success.
// Throws ApiError (HTTP / network errors) or Error if no token field is found.
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

// ─── Session validation ───────────────────────────────────────────────────────

export type OwnerRole = "SUPER_ADMIN" | "OWNER";

// Only the fields the frontend needs. Explicitly typed so the normalizer below
// cannot accidentally forward unsafe backend fields (e.g. passwordHash).
export interface OwnerProfile {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  role: OwnerRole;
}

// Confirmed Spring Boot /auth/me shape: flat { id, email, username, name, role }.
// { data: { ... } } retained as a fallback for envelope wrapping.
interface MeResponseRaw {
  id?: unknown;
  email?: unknown;
  username?: unknown;
  name?: unknown;
  role?: unknown;
  data?: {
    id?: unknown;
    email?: unknown;
    username?: unknown;
    name?: unknown;
    role?: unknown;
  };
}

// Coerces an unknown value to a valid OwnerRole, defaulting to "OWNER".
function normalizeRole(v: unknown): OwnerRole {
  if (v === "SUPER_ADMIN" || v === "OWNER") return v;
  return "OWNER";
}

// Returns true when `v` has the minimum required shape for OwnerProfile.
function isOwnerCandidate(
  v: unknown
): v is { id: string; email: string; username?: unknown; name?: unknown; role?: unknown } {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.email === "string" &&
    r.email.length > 0
  );
}

function extractOwnerProfile(body: MeResponseRaw): OwnerProfile | null {
  const candidates: unknown[] = [body, body.data];
  for (const candidate of candidates) {
    if (isOwnerCandidate(candidate)) {
      return {
        id: candidate.id,
        email: candidate.email,
        username: typeof candidate.username === "string" ? candidate.username : null,
        name: typeof candidate.name === "string" ? candidate.name : null,
        role: normalizeRole(candidate.role),
      };
    }
  }
  return null;
}

// GET /auth/me. Requires an owner token — uses ownerApiFetch so 401 triggers
// auto-logout automatically.
export async function getCurrentOwner(): Promise<OwnerProfile> {
  const body = await ownerApiFetch<MeResponseRaw>({
    method: "GET",
    url: "/auth/me",
  });
  const profile = extractOwnerProfile(body);
  if (!profile) {
    throw new Error("Current owner response shape is not supported yet.");
  }
  return profile;
}
