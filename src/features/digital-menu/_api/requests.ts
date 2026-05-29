// Public catalog request API.
//
// NEVER imports from features/owner.
// NEVER uses withOwnerAuthHeaders().
// The owner JWT must not be attached to public catalog calls.

import { apiFetch } from "@/lib/api/client";
import type {
  CreateCatalogRequestInput,
  CreateCatalogRequestResult,
} from "../_types/request.types";

export async function createCatalogRequest(
  businessSlug: string,
  payload: CreateCatalogRequestInput
): Promise<CreateCatalogRequestResult> {
  return apiFetch<CreateCatalogRequestResult>({
    method: "POST",
    url: `/catalog/${encodeURIComponent(businessSlug)}/requests`,
    data: payload,
  });
}
