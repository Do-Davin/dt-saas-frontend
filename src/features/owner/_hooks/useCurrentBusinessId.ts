import { useState } from "react";
import { getCurrentBusinessId } from "../_store/currentBusiness";

// Tiny wrapper around the temporary localStorage helper so pages don't have
// to spell out the lazy-init pattern. Reads once on mount; changing the
// localStorage value at runtime still requires a reload until a real business
// selector exists. When that selector lands, replace this hook with one that
// subscribes to the selector's state.
export function useCurrentBusinessId(): string | null {
  const [businessId] = useState<string | null>(() => getCurrentBusinessId());
  return businessId;
}
