import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getProduct } from "../_api/products";
import type { Product } from "../_api/products";

export type ProductState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; product: Product };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; product: Product };

// Loads a single product. `idle` when either ID is missing.
// Stale resolutions are filtered via the composite forKey tag.
export function useProduct(
  businessId: string | null,
  productId: string | undefined
): ProductState {
  const currentKey =
    businessId && productId ? `${businessId}::${productId}` : "";

  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId || !productId) return;
    let cancelled = false;
    const key = `${businessId}::${productId}`;
    getProduct(businessId, productId)
      .then((product) => {
        if (cancelled) return;
        setFetched({ forKey: key, state: { status: "ready", product } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the product.";
        setFetched({ forKey: key, state: { status: "error", message } });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, productId]);

  if (!currentKey) return { status: "idle" };
  if (!fetched || fetched.forKey !== currentKey) return { status: "loading" };
  return fetched.state;
}
