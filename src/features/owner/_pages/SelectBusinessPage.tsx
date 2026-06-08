import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
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

  function handleSelect(id: string) {
    useOwnerBusinessesStore.getState().selectBusiness(id);
    navigate("/owner/home", { replace: true });
  }

  if (isLoading && businesses.length === 0) {
    return <OwnerStateBlock title="Loading businesses…" />;
  }

  if (businesses.length === 0) {
    return (
      <OwnerStateBlock title="No business found for this owner yet." />
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          Select a business
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which business to manage.
        </p>
      </header>

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
    </div>
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
