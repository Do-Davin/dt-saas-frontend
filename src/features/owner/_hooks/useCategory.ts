import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCategory } from "../_api/categories";
import type { Category } from "../_api/categories";

export type CategoryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; category: Category };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; category: Category };

// Loads a single category. `idle` when either ID is missing.
// Stale resolutions are filtered via the composite forKey tag.
export function useCategory(
  businessId: string | null,
  categoryId: string | undefined
): CategoryState {
  const currentKey =
    businessId && categoryId ? `${businessId}::${categoryId}` : "";

  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId || !categoryId) return;
    let cancelled = false;
    const key = `${businessId}::${categoryId}`;
    getCategory(businessId, categoryId)
      .then((category) => {
        if (cancelled) return;
        setFetched({ forKey: key, state: { status: "ready", category } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the category.";
        setFetched({ forKey: key, state: { status: "error", message } });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, categoryId]);

  if (!currentKey) return { status: "idle" };
  if (!fetched || fetched.forKey !== currentKey) return { status: "loading" };
  return fetched.state;
}
