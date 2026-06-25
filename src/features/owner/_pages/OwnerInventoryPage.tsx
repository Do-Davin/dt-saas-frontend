import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

export function OwnerInventoryPage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Inventory"
        description="Stock and inventory management — coming soon."
      />
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Inventory module is under construction.
      </div>
    </OwnerPage>
  );
}
