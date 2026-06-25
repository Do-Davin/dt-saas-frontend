import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

export function OwnerAnalyticsPage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Analytics"
        description="Business performance and insights — coming soon."
      />
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        Analytics dashboard is under construction.
      </div>
    </OwnerPage>
  );
}
