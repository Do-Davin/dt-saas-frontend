import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listProducts } from "../_api/products";
import type { Product } from "../_api/products";

export type ProductListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Product[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: Product[] };

export interface ProductFilters {
  branchId: string;
  categoryId: string;
}

export function useProducts(
  businessId: string | null,
  filters: ProductFilters
): { state: ProductListState; refetch: () => void } {
  const { branchId: filterBranchId, categoryId: filterCategoryId } = filters;

  const [loadKey, setLoadKey] = useState(0);
  const [fetched, setFetched] = useState<
    { forKey: string; state: SettledState } | null
  >(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const currentKey = `${businessId}:${filterBranchId}:${filterCategoryId}:${loadKey}`;
    listProducts(businessId, {
      ...(filterBranchId ? { branchId: filterBranchId } : {}),
      ...(filterCategoryId ? { categoryId: filterCategoryId } : {}),
    })
      .then((items) => {
        if (cancelled) return;
        setFetched({ forKey: currentKey, state: { status: "ready", items } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading products.";
        setFetched({
          forKey: currentKey,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, filterBranchId, filterCategoryId, loadKey]);

  function refetch() {
    setLoadKey((k) => k + 1);
  }

  if (!businessId) return { state: { status: "idle" }, refetch };
  const currentKey = `${businessId}:${filterBranchId}:${filterCategoryId}:${loadKey}`;
  if (!fetched || fetched.forKey !== currentKey) {
    return { state: { status: "loading" }, refetch };
  }
  return { state: fetched.state, refetch };
}
