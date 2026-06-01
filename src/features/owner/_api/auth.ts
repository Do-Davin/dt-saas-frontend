// Owner auth API.
// Public catalog code must not import this file.
//
// loginOwner   — POST /auth/login, no token required, uses apiFetch directly.
// getCurrentOwner — GET /auth/me, token required, uses ownerApiFetch.
//
// TODO(spring-boot): confirm both endpoint paths after backend migration.

import { apiFetch } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

// ─── Login ────────────────────────────────────────────────────────────────────

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

// Intentionally permissive — all fields optional so a shape change does not
// cause a TypeScript error before the contract is pinned.
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

// Only the fields the frontend needs. Explicitly typed so the normalizer below
// cannot accidentally forward unsafe backend fields (e.g. passwordHash).
export interface OwnerProfile {
  id: string;
  email: string;
  name?: string | null;
}

// Permissive raw type covering all supported /auth/me response envelopes.
interface MeResponseRaw {
  id?: unknown;
  email?: unknown;
  name?: unknown;
  owner?: Record<string, unknown>;
  user?: Record<string, unknown>;
  data?: {
    id?: unknown;
    email?: unknown;
    name?: unknown;
    owner?: Record<string, unknown>;
    user?: Record<string, unknown>;
  };
}

// Returns true when `v` has the minimum required shape for OwnerProfile.
function isOwnerCandidate(
  v: unknown
): v is { id: string; email: string; name?: unknown } {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.email === "string" &&
    r.email.length > 0
  );
}

// Tries each envelope location in precedence order and returns the first
// valid OwnerProfile found. Explicitly picks only safe fields so no
// additional backend fields (e.g. passwordHash) leak into the return value
// regardless of what the backend sends.
function extractOwnerProfile(body: MeResponseRaw): OwnerProfile | null {
  const candidates: unknown[] = [
    body,
    body.owner,
    body.user,
    body.data,
    body.data?.owner,
    body.data?.user,
  ];
  for (const candidate of candidates) {
    if (isOwnerCandidate(candidate)) {
      return {
        id: candidate.id,
        email: candidate.email,
        name: typeof candidate.name === "string" ? candidate.name : null,
      };
    }
  }
  return null;
}

// GET /auth/me. Requires an owner token — uses ownerApiFetch so 401 triggers
// auto-logout automatically.
//
// TODO(spring-boot): confirm the exact path after backend migration.
// Likely candidates: /auth/me  /api/auth/me  /owner/me
// Update the url below once the path is pinned.
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
