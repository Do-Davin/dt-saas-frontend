import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getBusiness } from "../_api/businesses";
import type { OwnerBusiness } from "../_api/businesses";

export type BusinessState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; business: OwnerBusiness };

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; business: OwnerBusiness };

export function useBusiness(
  businessId: string | undefined
): BusinessState {
  const currentKey = businessId ?? "";

  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const key = businessId;
    getBusiness(businessId)
      .then((business) => {
        if (cancelled) return;
        setFetched({ forKey: key, state: { status: "ready", business } });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading the business.";
        setFetched({ forKey: key, state: { status: "error", message } });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (!currentKey) return { status: "idle" };
  if (!fetched || fetched.forKey !== currentKey) return { status: "loading" };
  return fetched.state;
}
