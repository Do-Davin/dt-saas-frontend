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

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: CustomerRequestListItem[] };

// Loads the owner request list for a single business. Pass `null` when the
// current business is not selected yet — the hook returns "idle" and never
// issues a request.
//
// Server state lives in this hook (useState) on purpose. It is page-local —
// no other page consumes the list today, so promoting it into Zustand would
// add coordination cost without any sharing benefit. If a future feature
// needs to share or invalidate this data, migrate to TanStack Query rather
// than reinventing a cache in Zustand.
//
// Lint-compliance note (react-hooks/set-state-in-effect): the effect does
// NOT call setState synchronously in its body. The visible "idle" and
// "loading" states are *derived* from `businessId` and from whether the
// most recent settled fetch was for the current `businessId`. Only the
// async resolution of `listOwnerRequests` writes state, and the
// `forBusinessId` tag tells the derivation which businessId that write
// belongs to — so a stale resolution can never leak onto a different
// business's view.
export function useOwnerRequests(
  businessId: string | null
): OwnerRequestsState {
  const [fetched, setFetched] = useState<
    { forBusinessId: string; state: SettledState } | null
  >(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    listOwnerRequests(businessId)
      .then((items) => {
        if (cancelled) return;
        setFetched({
          forBusinessId: businessId,
          state: { status: "ready", items },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading requests.";
        setFetched({
          forBusinessId: businessId,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (!businessId) return { status: "idle" };
  if (!fetched || fetched.forBusinessId !== businessId) {
    return { status: "loading" };
  }
  return fetched.state;
}
