import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getBranch } from "../_api/branches";
import type { Branch } from "../_api/branches";

export type BranchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; branch: Branch };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; branch: Branch };

// Loads a single branch. `idle` when either ID is missing.
// Uses a forKey tag so navigating between different branch edit pages
// (e.g. /branches/A → /branches/B) discards in-flight fetches for A.
//
// Lint-compliance: setState is called only inside .then() / .catch()
// callbacks — never synchronously in the effect body.
export function useBranch(
  businessId: string | null,
  branchId: string | undefined
): BranchState {
  const currentKey =
    businessId && branchId ? `${businessId}::${branchId}` : "";

  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId || !branchId) return;
    let cancelled = false;
    const key = `${businessId}::${branchId}`;
    getBranch(businessId, branchId)
      .then((branch) => {
        if (cancelled) return;
        setFetched({ forKey: key, state: { status: "ready", branch } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the branch.";
        setFetched({ forKey: key, state: { status: "error", message } });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, branchId]);

  if (!currentKey) return { status: "idle" };
  if (!fetched || fetched.forKey !== currentKey) return { status: "loading" };
  return fetched.state;
}
