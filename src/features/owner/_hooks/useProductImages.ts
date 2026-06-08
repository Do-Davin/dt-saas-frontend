import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listProductImages } from "../_api/productImages";
import type { ProductImage } from "../_api/productImages";

export type ImageListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; images: ProductImage[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; images: ProductImage[] };

// Loads images for a product. Both IDs are required strings — this hook is
// only called from ProductImageManager which renders inside ProductEditorForm,
// where businessId and productId are always available.
export function useProductImages(
  businessId: string,
  productId: string
): { state: ImageListState; refetch: () => void } {
  const [loadKey, setLoadKey] = useState(0);
  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const currentKey = `${businessId}::${productId}:${loadKey}`;
    listProductImages(businessId, productId)
      .then((images) => {
        if (cancelled) return;
        setFetched({ forKey: currentKey, state: { status: "ready", images } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading images.";
        setFetched({
          forKey: currentKey,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, productId, loadKey]);

  function refetch() {
    setLoadKey((k) => k + 1);
  }

  const currentKey = `${businessId}::${productId}:${loadKey}`;
  if (!fetched || fetched.forKey !== currentKey) {
    return { state: { status: "loading" }, refetch };
  }
  return { state: fetched.state, refetch };
}
