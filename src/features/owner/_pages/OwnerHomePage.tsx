import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { Building2Icon, CreditCardIcon } from "lucide-react";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

interface QuickNavCard {
  to: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  disabled?: boolean;
}

const QUICK_NAV: QuickNavCard[] = [
  {
    to: "/admin/businesses",
    label: "Businesses",
    description: "Add and manage business profiles on the platform.",
    Icon: Building2Icon,
  },
  {
    to: "#",
    label: "Subscriptions",
    description: "Manage subscription plans and billing. Coming soon.",
    Icon: CreditCardIcon,
    disabled: true,
  },
];

export function OwnerHomePage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Dashboard"
        description="Manage businesses and subscriptions on the DT SaaS platform."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_NAV.map(({ to, label, description, Icon, disabled }) =>
          disabled ? (
            <div
              key={to}
              className="rounded-lg border bg-card p-5 opacity-50 cursor-not-allowed"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ) : (
            <Link
              key={to}
              to={to}
              className="group rounded-lg border bg-card p-5 transition-all duration-200 ease-out hover:bg-accent/50 hover:-translate-y-0.5 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </Link>
          )
        )}
      </div>
    </OwnerPage>
  );
}
