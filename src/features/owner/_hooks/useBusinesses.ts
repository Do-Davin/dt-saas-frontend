import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOwnerBusinesses } from "../_api/businesses";
import type { OwnerBusiness } from "../_api/businesses";

export type BusinessListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: OwnerBusiness[] };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; items: OwnerBusiness[] };

export function useBusinesses(): {
  state: BusinessListState;
  refetch: () => void;
} {
  const [loadKey, setLoadKey] = useState(0);
  const [fetched, setFetched] = useState<{
    forKey: number;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    listOwnerBusinesses()
      .then((items) => {
        if (cancelled) return;
        setFetched({ forKey: loadKey, state: { status: "ready", items } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading businesses.";
        setFetched({ forKey: loadKey, state: { status: "error", message } });
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  function refetch() {
    setLoadKey((k) => k + 1);
  }

  if (!fetched || fetched.forKey !== loadKey) {
    return { state: { status: "loading" }, refetch };
  }
  return { state: fetched.state, refetch };
}
