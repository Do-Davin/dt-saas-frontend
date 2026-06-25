import { Link, useNavigate, useLocation } from "react-router";
import { ArrowLeftIcon, PackageIcon, PlusCircleIcon } from "lucide-react";
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.startsWith("/admin") ? "/admin" : "/owner";
  const home = base === "/admin" ? "/admin/home" : "/owner/analytics";

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
      {/* Mobile-only product toolbar — replaces the hidden shell header on
          this route. -mx-4 -mt-5 break out of the main's padding so the bar
          is edge-to-edge and sticky to the top of the scroll area. */}
      <div className="sticky top-0 z-20 -mx-4 -mt-5 mb-3 flex items-center gap-2 border-b bg-background px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => navigate(home)}
          aria-label="Back to home"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10"
        >
          <ArrowLeftIcon className="size-5" strokeWidth={2.5} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-black tracking-tight text-primary">
          Products
        </h1>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-11 rounded-xl border-2 border-primary px-3 text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary"
        >
          <Link to={`${base}/products/new`} aria-label="Create new product">
            <PlusCircleIcon className="size-4" />
            New
          </Link>
        </Button>
      </div>

      {/* Desktop header — hidden on mobile (mobile uses the toolbar above) */}
      <div className="hidden md:block">
        <OwnerPageHeader
          title="Products"
          actions={
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
            >
              <Link to={`${base}/products/new`}>
                <PackageIcon className="size-4" />
                New product
              </Link>
            </Button>
          }
        />
      </div>

      <ProductBrowserPanel businessId={businessId} />
    </OwnerPage>
  );
}
