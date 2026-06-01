import { useEffect } from "react";
import { Link, Outlet } from "react-router";
import { useOwnerSessionStore } from "../_store/ownerSession";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import type { OwnerBusiness } from "../_api/businesses";

// Derive the text to show in the business context slot of the header.
// Returns null while loading or in edge cases that need no hint.
function getBusinessHint(
  isLoading: boolean,
  businesses: OwnerBusiness[],
  selectedBusinessId: string | null
): string | null {
  if (isLoading) return null;
  if (businesses.length === 0) return "No business yet";
  const selected = businesses.find((b) => b.id === selectedBusinessId);
  if (selected) return selected.name;
  if (businesses.length > 1) return "Select business";
  return null;
}

// Owner dashboard shell — header + nav + outlet.
//
// On mount, owner session and business list are loaded in parallel. The store
// guards (owner !== null / businesses.length > 0) prevent repeated fetches if
// the shell unmounts and remounts. The outlet renders immediately — neither
// load blocks page content.
//
// 401: ownerApiFetch clears the token and redirects before errors reach the
// stores, so no redirect logic is needed here.
export function OwnerShell() {
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

  const businessHint = getBusinessHint(
    isBusinessesLoading,
    businesses,
    selectedBusinessId
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">
            DT SaaS Owner Dashboard
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Context hint — hidden on mobile to avoid header crowding */}
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
                  {owner && businessHint ? (
                    <span aria-hidden>·</span>
                  ) : null}
                  {businessHint ? (
                    <span className="truncate max-w-32">{businessHint}</span>
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
            </nav>
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
