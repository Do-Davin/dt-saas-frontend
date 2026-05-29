import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getOwnerRequest } from "../_api/requests";
import type { CustomerRequestDetail } from "../_types/request.types";

// Discriminated state for a single owner request. `idle` covers the case
// where either businessId or requestId is missing — the page renders an
// explanation block before inspecting `status`, so this branch is mostly
// defensive.
export type OwnerRequestDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; request: CustomerRequestDetail };

// Loads one owner request. Pass `null`/`undefined` for either input when the
// prerequisite is not satisfied — the hook stays in "idle" and never issues
// a request.
//
// Server state lives in this hook (useState) on purpose, mirroring
// useOwnerRequests: page-local, not shared, so a Zustand slice would add
// coordination cost without any sharing benefit. Migrate to TanStack Query
// when this data needs to be shared, invalidated, or refetched cross-page.
export function useOwnerRequestDetail(
  businessId: string | null,
  requestId: string | undefined
): OwnerRequestDetailState {
  const ready = Boolean(businessId && requestId);
  const [state, setState] = useState<OwnerRequestDetailState>(() =>
    ready ? { status: "loading" } : { status: "idle" }
  );

  useEffect(() => {
    if (!businessId || !requestId) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getOwnerRequest(businessId, requestId)
      .then((request) => {
        if (!cancelled) setState({ status: "ready", request });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the request.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, requestId]);

  return state;
}
