import { Link } from "react-router";
import { PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { ProductBrowserPanel } from "../_components/ProductBrowserPanel";

export function ProductListPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Products"
        actions={
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
          >
            <Link to="/owner/products/new">
              <PackageIcon className="size-4" />
              New product
            </Link>
          </Button>
        }
      />
      <ProductBrowserPanel businessId={businessId} />
    </OwnerPage>
  );
}
