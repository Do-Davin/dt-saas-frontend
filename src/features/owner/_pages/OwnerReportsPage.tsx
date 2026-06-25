import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

export function OwnerReportsPage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Reports"
        description="Sales and operational reports — coming soon."
      />
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Reports are under construction.
      </div>
    </OwnerPage>
  );
}
