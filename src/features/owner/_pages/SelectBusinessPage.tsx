import { useNavigate, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import type { OwnerBusiness } from "../_api/businesses";

// Page for owners with multiple businesses to choose which one to manage.
// Business data is already loaded by OwnerShell on mount, so this page
// reads from the store rather than initiating its own fetch.
export function SelectBusinessPage() {
  const businesses = useOwnerBusinessesStore((s) => s.businesses);
  const selectedBusinessId = useOwnerBusinessesStore(
    (s) => s.selectedBusinessId
  );
  const isLoading = useOwnerBusinessesStore((s) => s.isLoading);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const home = pathname.startsWith("/admin") ? "/admin/home" : "/owner/analytics";

  function handleSelect(id: string) {
    useOwnerBusinessesStore.getState().selectBusiness(id);
    navigate(home, { replace: true });
  }

  if (isLoading && businesses.length === 0) {
    return <OwnerPageState type="loading" title="Loading businesses…" />;
  }

  if (businesses.length === 0) {
    return (
      <OwnerPageState type="empty" title="No business found for this owner yet." />
    );
  }

  return (
    <OwnerPage className="max-w-sm">
      <OwnerPageHeader
        title="Select a business"
        description="Choose which business to manage."
      />

      <ul className="space-y-2">
        {businesses.map((b) => (
          <li key={b.id}>
            <BusinessCard
              business={b}
              isCurrent={b.id === selectedBusinessId}
              onSelect={() => handleSelect(b.id)}
            />
          </li>
        ))}
      </ul>
    </OwnerPage>
  );
}

interface BusinessCardProps {
  business: OwnerBusiness;
  isCurrent: boolean;
  onSelect: () => void;
}

function BusinessCard({ business, isCurrent, onSelect }: BusinessCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isCurrent && "border-primary ring-1 ring-primary"
      )}
      onClick={onSelect}
      aria-pressed={isCurrent}
    >
      <span className="block font-medium">{business.name}</span>
      {business.nameKm ? (
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {business.nameKm}
        </span>
      ) : null}
      {isCurrent ? (
        <span className="mt-1 block text-xs text-primary">
          Currently selected
        </span>
      ) : null}
    </button>
  );
}
