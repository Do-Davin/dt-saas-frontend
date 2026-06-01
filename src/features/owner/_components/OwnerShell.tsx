import { useEffect } from "react";
import { Link, Outlet } from "react-router";
import { useOwnerSessionStore } from "../_store/ownerSession";

// Owner dashboard shell — header + nav + outlet.
// Validates the owner session once on mount by calling loadOwner(). The shell
// and outlet render immediately; the owner hint in the header updates once the
// /auth/me response arrives. A slow or failed validation never blocks the UI —
// 401 is handled by ownerApiFetch (clears token + redirect) before it reaches
// the store; other errors are silently absorbed here.
export function OwnerShell() {
  const owner = useOwnerSessionStore((s) => s.owner);
  const isLoading = useOwnerSessionStore((s) => s.isLoading);

  useEffect(() => {
    void useOwnerSessionStore.getState().loadOwner();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">
            DT SaaS Owner Dashboard
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            {isLoading ? (
              <span className="hidden sm:block text-xs text-muted-foreground">
                Loading…
              </span>
            ) : owner ? (
              <span
                className="hidden sm:block text-xs text-muted-foreground truncate max-w-48"
                title={owner.email}
              >
                {owner.name ?? owner.email}
              </span>
            ) : null}
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
