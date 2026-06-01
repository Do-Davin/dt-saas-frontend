import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";

// Returns the currently selected business ID from the owner businesses store.
// Source of truth is now ownerBusinessesStore.selectedBusinessId, which is
// loaded by OwnerShell on mount and validated against the backend business list.
//
// The return type (string | null) is unchanged, so all existing consumers
// (OwnerRequestListPage, OwnerRequestDetailPage) work without modification.
//
// The old localStorage read (getCurrentBusinessId) is no longer used here —
// ownerBusinesses store seeds itself from that helper on creation and owns all
// subsequent reads. currentBusiness.ts itself is kept for now because the store
// still delegates persistence writes/clears to it.
export function useCurrentBusinessId(): string | null {
  return useOwnerBusinessesStore((s) => s.selectedBusinessId);
}
