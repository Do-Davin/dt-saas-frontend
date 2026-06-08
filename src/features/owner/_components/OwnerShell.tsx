import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useOwnerAuthStore } from "../_store/ownerAuth";
import { useOwnerSessionStore } from "../_store/ownerSession";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";

// Owner dashboard shell — header + nav + outlet.
//
// On mount, owner session and business list are loaded in parallel. Store
// guards prevent re-fetching on remount when data is already present.
// The outlet renders immediately — neither load blocks page content.
//
// 401: ownerApiFetch clears the token and redirects before errors reach
// the stores, so no redirect logic is needed here.
export function OwnerShell() {
  const navigate = useNavigate();
  const owner = useOwnerSessionStore((s) => s.owner);
  const isSessionLoading = useOwnerSessionStore((s) => s.isLoading);
  const businesses = useOwnerBusinessesStore((s) => s.businesses);
  const selectedBusinessId = useOwnerBusinessesStore(
    (s) => s.selectedBusinessId
  );
  const isBusinessesLoading = useOwnerBusinessesStore((s) => s.isLoading);

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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">
            DT SaaS Owner Dashboard
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Owner + business context hint — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              {isSessionLoading && !owner ? (
                <span>Loading…</span>
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
                      <>
                        <span
                          className="truncate max-w-32"
                          title={selectedBusiness.name}
                        >
                          {selectedBusiness.name}
                        </span>
                        {businesses.length > 1 ? (
                          <Link
                            to="/owner/select-business"
                            className="shrink-0 underline-offset-2 hover:underline"
                          >
                            Switch
                          </Link>
                        ) : null}
                      </>
                    ) : businesses.length > 1 ? (
                      <Link
                        to="/owner/select-business"
                        className="underline-offset-2 hover:underline"
                      >
                        Select business
                      </Link>
                    ) : null
                  ) : null}
                </>
              )}
            </div>

            <nav
              aria-label="Owner dashboard sections"
              className="flex items-center gap-1 sm:gap-2 text-sm"
            >
              <Link
                to="/owner/home"
                className="rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Home
              </Link>
              <Link
                to="/owner/requests"
                className="rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Requests
              </Link>
              <Link
                to="/owner/branches"
                className="rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Branches
              </Link>
              <Link
                to="/owner/categories"
                className="rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Categories
              </Link>
            </nav>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
