import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listSales } from "../_api/sales";
import type { SaleListItem } from "../_api/sales";

export type SaleListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: SaleListItem[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: SaleListItem[] };

export function useSales(
  businessId: string | null,
): { state: SaleListState; refetch: () => void } {
  const [loadKey, setLoadKey] = useState(0);
  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const currentKey = `${businessId}:${loadKey}`;
    listSales(businessId, { page: 0, size: 50 })
      .then((resp) => {
        if (cancelled) return;
        setFetched({
          forKey: currentKey,
          state: { status: "ready", items: resp.items },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong loading sales.";
        setFetched({ forKey: currentKey, state: { status: "error", message } });
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
