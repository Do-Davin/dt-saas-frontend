import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getOwnerRequest,
  updateOwnerRequestStatus,
} from "../_api/requests";
import type {
  CustomerRequestDetail,
  RequestStatus,
} from "../_types/request.types";

// Discriminated state for a single owner request. `idle` covers the case
// where either businessId or requestId is missing — the page renders an
// explanation block before inspecting `status`, so this branch is mostly
// defensive.
export type OwnerRequestDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; request: CustomerRequestDetail };

type SettledDetail =
  | { status: "error"; message: string }
  | { status: "ready"; request: CustomerRequestDetail };

interface UpdateRecord {
  forKey: string;
  pending: boolean;
  error: string | null;
}

const EMPTY_UPDATE: UpdateRecord = {
  forKey: "",
  pending: false,
  error: null,
};

export interface OwnerRequestDetailResult {
  state: OwnerRequestDetailState;
  updateStatus: (next: RequestStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  updateError: string | null;
}

// Loads one owner request and exposes a status-update action.
//
// Server state lives in this hook (useState) on purpose, mirroring
// useOwnerRequests: page-local, not shared, so a Zustand slice would add
// coordination cost without any sharing benefit. Migrate to TanStack Query
// when this data needs to be shared, invalidated, or refetched cross-page.
//
// Lint-compliance note (react-hooks/set-state-in-effect): the effect does
// NOT call setState synchronously in its body. Both fetched-state and
// update-state carry a `forKey` tag (`${businessId}::${requestId}`). The
// visible state, isUpdatingStatus, and updateError are all *derived* by
// comparing those tags against the current key — so navigating to a
// different request automatically discards in-flight updates and stale
// fetches without any setState in the effect body.
export function useOwnerRequestDetail(
  businessId: string | null,
  requestId: string | undefined
): OwnerRequestDetailResult {
  const currentKey =
    businessId && requestId ? `${businessId}::${requestId}` : "";

  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledDetail;
  } | null>(null);
  const [updateRecord, setUpdateRecord] =
    useState<UpdateRecord>(EMPTY_UPDATE);

  useEffect(() => {
    if (!businessId || !requestId) return;
    const submittedKey = `${businessId}::${requestId}`;
    let cancelled = false;
    getOwnerRequest(businessId, requestId)
      .then((request) => {
        if (cancelled) return;
        setFetched({
          forKey: submittedKey,
          state: { status: "ready", request },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the request.";
        setFetched({
          forKey: submittedKey,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, requestId]);

  let state: OwnerRequestDetailState;
  if (!currentKey) {
    state = { status: "idle" };
  } else if (!fetched || fetched.forKey !== currentKey) {
    state = { status: "loading" };
  } else {
    state = fetched.state;
  }

  const isUpdatingStatus =
    updateRecord.forKey === currentKey && updateRecord.pending;
  const updateError =
    updateRecord.forKey === currentKey ? updateRecord.error : null;

  async function updateStatus(next: RequestStatus): Promise<void> {
    if (!businessId || !requestId) return;
    const submittedKey = `${businessId}::${requestId}`;
    if (
      updateRecord.forKey === submittedKey &&
      updateRecord.pending
    ) {
      return;
    }
    setUpdateRecord({ forKey: submittedKey, pending: true, error: null });
    try {
      const updated = await updateOwnerRequestStatus(
        businessId,
        requestId,
        next
      );
      setFetched({
        forKey: submittedKey,
        state: { status: "ready", request: updated },
      });
      setUpdateRecord({
        forKey: submittedKey,
        pending: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Could not update status.";
      setUpdateRecord({
        forKey: submittedKey,
        pending: false,
        error: message,
      });
    }
  }

  return { state, updateStatus, isUpdatingStatus, updateError };
}
