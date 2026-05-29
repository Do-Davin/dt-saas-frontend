import { useEffect, useRef, useState } from "react";
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
export function useOwnerRequestDetail(
  businessId: string | null,
  requestId: string | undefined
): OwnerRequestDetailResult {
  const ready = Boolean(businessId && requestId);
  const [state, setState] = useState<OwnerRequestDetailState>(() =>
    ready ? { status: "loading" } : { status: "idle" }
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Stable key for the currently-mounted (businessId, requestId) pair.
  // Used to drop late PATCH/GET resolutions after the user has navigated
  // to a different request, preventing data from one request leaking onto
  // the page of another.
  const currentKey =
    businessId && requestId ? `${businessId}::${requestId}` : "";
  const currentKeyRef = useRef(currentKey);
  useEffect(() => {
    currentKeyRef.current = currentKey;
  }, [currentKey]);

  useEffect(() => {
    setUpdateError(null);
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

  async function updateStatus(next: RequestStatus): Promise<void> {
    if (!businessId || !requestId) return;
    if (isUpdatingStatus) return;
    const submittedKey = `${businessId}::${requestId}`;
    setIsUpdatingStatus(true);
    setUpdateError(null);
    try {
      const updated = await updateOwnerRequestStatus(
        businessId,
        requestId,
        next
      );
      if (currentKeyRef.current !== submittedKey) return;
      setState({ status: "ready", request: updated });
    } catch (err: unknown) {
      if (currentKeyRef.current !== submittedKey) return;
      const message =
        err instanceof ApiError ? err.message : "Could not update status.";
      setUpdateError(message);
    } finally {
      if (currentKeyRef.current === submittedKey) {
        setIsUpdatingStatus(false);
      }
    }
  }

  return { state, updateStatus, isUpdatingStatus, updateError };
}
