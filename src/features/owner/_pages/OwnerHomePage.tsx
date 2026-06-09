import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  Building2Icon,
  InboxIcon,
  GitBranchIcon,
  TagIcon,
  PackageIcon,
} from "lucide-react";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";

interface QuickNavCard {
  to: string;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const QUICK_NAV: QuickNavCard[] = [
  {
    to: "/owner/businesses",
    label: "Businesses",
    description: "Add and manage your business profiles.",
    Icon: Building2Icon,
  },
  {
    to: "/owner/requests",
    label: "Requests",
    description: "Review and respond to incoming owner requests.",
    Icon: InboxIcon,
  },
  {
    to: "/owner/branches",
    label: "Branches",
    description: "Configure branch locations for your selected business.",
    Icon: GitBranchIcon,
  },
  {
    to: "/owner/categories",
    label: "Categories",
    description: "Organize menu items into categories.",
    Icon: TagIcon,
  },
  {
    to: "/owner/products",
    label: "Products",
    description: "Add and manage products in your digital menu.",
    Icon: PackageIcon,
  },
];

export function OwnerHomePage() {
  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Dashboard"
        description="Manage your businesses, menus, and incoming requests."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_NAV.map(({ to, label, description, Icon }) => (
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
        ))}
      </div>
    </OwnerPage>
  );
}
