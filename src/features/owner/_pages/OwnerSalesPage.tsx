import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

export function OwnerSalesPage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Sales"
        description="Sales management and order processing — coming soon."
      />
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Sales module is under construction.
      </div>
    </OwnerPage>
  );
}
