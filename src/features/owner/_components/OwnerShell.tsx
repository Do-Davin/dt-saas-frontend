import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  HomeIcon,
  Building2Icon,
  InboxIcon,
  GitBranchIcon,
  TagIcon,
  PackageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useOwnerAuthStore } from "../_store/ownerAuth";
import { useOwnerSessionStore } from "../_store/ownerSession";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";

// ─── Nav config ──────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; Icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { to: "/owner/home", label: "Home", Icon: HomeIcon },
  { to: "/owner/businesses", label: "Businesses", Icon: Building2Icon },
  { to: "/owner/requests", label: "Requests", Icon: InboxIcon },
  { to: "/owner/branches", label: "Branches", Icon: GitBranchIcon },
  { to: "/owner/categories", label: "Categories", Icon: TagIcon },
  { to: "/owner/products", label: "Products", Icon: PackageIcon },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(
  name: string | null | undefined,
  email: string
): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
    }
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

interface SidebarNavLinkProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

function SidebarNavLink({
  item,
  collapsed,
  active,
  onClick,
}: SidebarNavLinkProps) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <item.Icon className="size-4 shrink-0" />
      {!collapsed ? <span>{item.label}</span> : null}
    </Link>
  );
}

// ─── Sidebar nav links ────────────────────────────────────────────────────────

interface NavLinksProps {
  collapsed?: boolean;
  activePath: string;
  onNav?: () => void;
}

function NavLinks({ collapsed = false, activePath, onNav }: NavLinksProps) {
  function isActive(path: string) {
    return activePath === path || activePath.startsWith(path + "/");
  }
  return (
    <nav
      aria-label="Owner dashboard navigation"
      className="flex-1 space-y-0.5 px-2 py-3"
    >
      {NAV_ITEMS.map((item) => (
        <SidebarNavLink
          key={item.to}
          item={item}
          collapsed={collapsed}
          active={isActive(item.to)}
          onClick={onNav}
        />
      ))}
    </nav>
  );
}

// ─── Brand mark ───────────────────────────────────────────────────────────────

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground",
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs"
      )}
    >
      DT
    </span>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

// Owner dashboard shell — sidebar + header + outlet.
//
// On mount, owner session and business list are loaded in parallel. Store
// guards prevent re-fetching on remount when data is already present.
// The outlet renders immediately — neither load blocks page content.
//
// 401: ownerApiFetch clears the token and redirects before errors reach
// the stores, so no redirect logic is needed here.
export function OwnerShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const owner = useOwnerSessionStore((s) => s.owner);
  const isSessionLoading = useOwnerSessionStore((s) => s.isLoading);
  const businesses = useOwnerBusinessesStore((s) => s.businesses);
  const selectedBusinessId = useOwnerBusinessesStore(
    (s) => s.selectedBusinessId
  );
  const isBusinessesLoading = useOwnerBusinessesStore((s) => s.isLoading);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void useOwnerSessionStore.getState().loadOwner();
    void useOwnerBusinessesStore.getState().loadBusinesses();
  }, []);

  // Scroll main content back to top on every route change.
  // Required because <main> uses overflow-y-auto (not window scroll), so the
  // browser's native scroll restoration does not apply to it.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Close profile dropdown on outside pointer-down
  useEffect(() => {
    if (!profileOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [profileOpen]);

  function handleLogout() {
    useOwnerAuthStore.getState().clearToken();
    useOwnerSessionStore.getState().clearOwner();
    useOwnerBusinessesStore.getState().clearBusinesses();
    navigate("/owner/login", { replace: true });
  }

  const selectedBusiness =
    businesses.find((b) => b.id === selectedBusinessId) ?? null;

  const initials = owner ? getInitials(owner.name, owner.email) : "—";

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-[width] duration-200 shrink-0",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Brand area */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b",
            sidebarCollapsed
              ? "flex-col justify-center gap-1 py-2"
              : "justify-between gap-2 px-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 min-w-0",
              sidebarCollapsed && "justify-center"
            )}
          >
            <BrandMark />
            {!sidebarCollapsed ? (
              <span className="truncate text-sm font-semibold tracking-tight">
                DT SaaS Dashboard
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="size-3.5" />
            ) : (
              <ChevronLeftIcon className="size-3.5" />
            )}
          </button>
        </div>

        <NavLinks collapsed={sidebarCollapsed} activePath={location.pathname} />
      </aside>

      {/* ── Right column: header + main ──────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" />
          </button>

          {/* Mobile brand (only visible on small screens) */}
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark size="sm" />
            <span className="text-sm font-semibold tracking-tight">
              DT SaaS
            </span>
          </div>

          <div className="flex-1" />

          {/* Business context */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            {isSessionLoading && !owner ? (
              <span>Loading…</span>
            ) : !isBusinessesLoading ? (
              businesses.length === 0 ? (
                <span>No business yet</span>
              ) : selectedBusiness ? (
                <>
                  <span
                    className="truncate max-w-40"
                    title={selectedBusiness.name}
                  >
                    {selectedBusiness.name}
                  </span>
                  {businesses.length > 1 ? (
                    <Link
                      to="/owner/select-business"
                      className="shrink-0 text-xs underline-offset-2 hover:underline"
                    >
                      Switch
                    </Link>
                  ) : null}
                </>
              ) : businesses.length > 1 ? (
                <Link
                  to="/owner/select-business"
                  className="text-xs underline-offset-2 hover:underline"
                >
                  Select business
                </Link>
              ) : null
            ) : null}
          </div>

          {/* Profile dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground select-none">
                {initials}
              </span>
              <ChevronDownIcon className="size-3 text-muted-foreground" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-10 z-20 w-52 rounded-lg border bg-popover py-1 shadow-md">
                <div className="px-3 py-2">
                  {owner ? (
                    <>
                      <p className="truncate text-sm font-medium text-foreground">
                        {owner.name ?? owner.email}
                      </p>
                      {owner.name ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {owner.email}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Account</p>
                  )}
                </div>
                <Separator />
                <div className="p-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOutIcon className="size-4 shrink-0 text-muted-foreground" />
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile sidebar (Sheet) ────────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0" showCloseButton={false}>
          {/* Brand */}
          <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <BrandMark />
            <SheetTitle className="text-sm font-semibold tracking-tight">
              DT SaaS Dashboard
            </SheetTitle>
          </div>
          {/* Nav */}
          <NavLinks
            activePath={location.pathname}
            onNav={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

    </div>
  );
}
