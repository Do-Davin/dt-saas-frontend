// Derives a user-facing message for when no business is selected.
// Shared by owner pages (OwnerRequestListPage, OwnerRequestDetailPage) that
// need a selected business to load data. Reads from the ownerBusinesses store
// so the message differentiates loading, zero-business, and multi-business
// states without each page importing the store directly.

import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";

export interface BusinessContextMessage {
  title: string;
  description?: string;
}

export function useBusinessContextMessage(): BusinessContextMessage {
  const isLoading = useOwnerBusinessesStore((s) => s.isLoading);
  const businesses = useOwnerBusinessesStore((s) => s.businesses);
  const selectedBusinessId = useOwnerBusinessesStore(
    (s) => s.selectedBusinessId
  );

  if (isLoading) {
    return { title: "Loading business context…" };
  }
  if (businesses.length === 0) {
    return { title: "No business found for this owner yet." };
  }
  if (businesses.length > 1 && !selectedBusinessId) {
    return {
      title: "No business selected yet.",
      description: "Please select a business from the owner header.",
    };
  }
  return { title: "No business selected yet." };
}
