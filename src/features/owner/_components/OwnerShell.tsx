import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  InboxIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOwnerAuthStore } from "../_store/ownerAuth";
import { useOwnerSessionStore } from "../_store/ownerSession";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";

const NAV_ITEMS = [
  { to: "/owner/home", label: "Home", icon: HomeIcon },
  { to: "/owner/requests", label: "Requests", icon: InboxIcon },
] as const;

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    void useOwnerSessionStore.getState().loadOwner();
    void useOwnerBusinessesStore.getState().loadBusinesses();
  }, []);

  function handleLogout() {
    useOwnerAuthStore.getState().clearToken();
    useOwnerSessionStore.getState().clearOwner();
    useOwnerBusinessesStore.getState().clearBusinesses();
    navigate("/owner/login", { replace: true });
  }

  const selectedBusiness =
    businesses.find((b) => b.id === selectedBusinessId) ?? null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          {/* ── Brand + mobile toggle ─────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </Button>

            <h1 className="text-sm sm:text-lg font-semibold tracking-tight whitespace-nowrap">
              <span className="sm:hidden">DT SaaS</span>
              <span className="hidden sm:inline">DT SaaS Owner Dashboard</span>
            </h1>
          </div>

          {/* ── Desktop right section ────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Owner + business context hint — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              {isSessionLoading && !owner ? (
                <span className="animate-pulse">Loading…</span>
              ) : (
                <>
                  {owner ? (
                    <span
                      className="truncate max-w-32"
                      title={owner.email}
                    >
                      {owner.name ?? owner.email}
                    </span>
                  ) : null}

                  {/* Separator — only when owner is known and businesses settled */}
                  {owner && !isBusinessesLoading ? (
                    <span aria-hidden>·</span>
                  ) : null}

                  {/* Business context */}
                  {!isBusinessesLoading ? (
                    businesses.length === 0 ? (
                      <span>No business yet</span>
                    ) : selectedBusiness ? (
                      <span
                        className="truncate max-w-32"
                        title={selectedBusiness.name}
                      >
                        {selectedBusiness.name}
                      </span>
                    ) : businesses.length > 1 ? (
                      <div className="relative">
                        <select
                          className="appearance-none text-xs rounded-md border border-input bg-background pl-2 pr-6 py-1 text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
                          value={selectedBusinessId ?? ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            if (id) {
                              useOwnerBusinessesStore
                                .getState()
                                .selectBusiness(id);
                            }
                          }}
                          aria-label="Select business"
                        >
                          <option value="" disabled>
                            Select business
                          </option>
                          {businesses.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      </div>
                    ) : null
                  ) : null}
                </>
              )}
            </div>

            {/* Desktop nav links */}
            <nav
              aria-label="Owner dashboard sections"
              className="hidden sm:flex items-center gap-1 text-sm"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`
                      inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5
                      text-foreground transition-colors
                      hover:bg-accent hover:text-accent-foreground
                      ${isActive ? "bg-accent/60 text-accent-foreground font-medium" : ""}
                    `}
                  >
                    <item.icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop log out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex gap-1.5"
            >
              <LogOutIcon className="size-3.5" />
              Log out
            </Button>

            {/* Mobile log out — icon only */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="sm:hidden"
              aria-label="Log out"
            >
              <LogOutIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* ── Mobile slide-down menu ───────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-card animate-in slide-in-from-top-2 duration-200">
            <div className="mx-auto max-w-5xl px-4 py-3 space-y-3">
              {/* Owner / business context on mobile */}
              <div className="text-xs text-muted-foreground space-y-1">
                {isSessionLoading && !owner ? (
                  <span className="animate-pulse">Loading…</span>
                ) : owner ? (
                  <p className="truncate" title={owner.email}>
                    Signed in as{" "}
                    <span className="font-medium text-foreground">
                      {owner.name ?? owner.email}
                    </span>
                  </p>
                ) : null}

                {!isBusinessesLoading && selectedBusiness ? (
                  <p className="truncate" title={selectedBusiness.name}>
                    Business:{" "}
                    <span className="font-medium text-foreground">
                      {selectedBusiness.name}
                    </span>
                  </p>
                ) : !isBusinessesLoading && businesses.length === 0 ? (
                  <p>No business linked yet</p>
                ) : null}

                {/* Multi-business selector on mobile */}
                {!isBusinessesLoading && businesses.length > 1 && !selectedBusiness ? (
                  <div className="relative mt-1">
                    <select
                      className="w-full appearance-none text-xs rounded-md border border-input bg-background pl-2 pr-6 py-1.5 text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
                      value={selectedBusinessId ?? ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) {
                          useOwnerBusinessesStore
                            .getState()
                            .selectBusiness(id);
                        }
                      }}
                      aria-label="Select business"
                    >
                      <option value="" disabled>
                        Select business
                      </option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  </div>
                ) : null}
              </div>

              {/* Mobile nav links */}
              <nav
                aria-label="Owner dashboard sections — mobile"
                className="flex flex-col gap-1"
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`
                        flex items-center gap-2.5 rounded-md px-3 py-2.5
                        text-sm transition-colors
                        hover:bg-accent hover:text-accent-foreground
                        ${isActive ? "bg-accent/60 text-accent-foreground font-medium" : "text-foreground"}
                      `}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
