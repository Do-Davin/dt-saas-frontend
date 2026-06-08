import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listBranches } from "../_api/branches";
import type { Branch } from "../_api/branches";

export type BranchListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Branch[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: Branch[] };

// Loads the branch list for a business. Returns a `refetch` function so
// callers can force a reload after a mutation (e.g. delete) without
// remounting. The `loadKey` increments on each `refetch()` call; when it
// or `businessId` changes the effect re-fires.
//
// Lint-compliance: setState is called only inside .then() / .catch()
// callbacks — never synchronously in the effect body.
export function useBranches(businessId: string | null): {
  state: BranchListState;
  refetch: () => void;
} {
  const [loadKey, setLoadKey] = useState(0);
  const [fetched, setFetched] = useState<
    { forKey: string; state: SettledState } | null
  >(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const currentKey = `${businessId}:${loadKey}`;
    listBranches(businessId)
      .then((items) => {
        if (cancelled) return;
        setFetched({ forKey: currentKey, state: { status: "ready", items } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading branches.";
        setFetched({
          forKey: currentKey,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, loadKey]);

  function refetch() {
    setLoadKey((k) => k + 1);
  }

  if (!businessId) return { state: { status: "idle" }, refetch };
  const currentKey = `${businessId}:${loadKey}`;
  if (!fetched || fetched.forKey !== currentKey) {
    return { state: { status: "loading" }, refetch };
  }
  return { state: fetched.state, refetch };
}
