import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOwnerRequests } from "../_api/requests";
import type { CustomerRequestListItem } from "../_types/request.types";

// Discriminated state for the owner request list.
// `idle` = no businessId yet → no fetch attempted (page renders the setup
// block before inspecting `status`, so this branch is mostly defensive).
export type OwnerRequestsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: CustomerRequestListItem[] };

// Loads the owner request list for a single business. Pass `null` when the
// current business is not selected yet — the hook stays in "idle" and never
// issues a request.
//
// Server state lives in this hook (useState) on purpose. It is page-local —
// no other page consumes the list today, so promoting it into Zustand would
// add coordination cost without any sharing benefit. If a future feature
// needs to share or invalidate this data, migrate to TanStack Query rather
// than reinventing a cache in Zustand.
export function useOwnerRequests(
  businessId: string | null
): OwnerRequestsState {
  const [state, setState] = useState<OwnerRequestsState>(() =>
    businessId ? { status: "loading" } : { status: "idle" }
  );

  useEffect(() => {
    if (!businessId) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    listOwnerRequests(businessId)
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading requests.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  return state;
}
