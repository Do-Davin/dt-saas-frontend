import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listCategories } from "../_api/categories";
import type { Category } from "../_api/categories";

export type CategoryListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Category[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: Category[] };

export function useCategories(businessId: string | null): {
  state: CategoryListState;
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
    listCategories(businessId)
      .then((items) => {
        if (cancelled) return;
        setFetched({ forKey: currentKey, state: { status: "ready", items } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading categories.";
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
