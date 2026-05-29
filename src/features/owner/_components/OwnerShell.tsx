import { Link, Outlet } from "react-router";

// Owner dashboard shell — header + simple nav + outlet. Intentionally minimal:
// no sidebar, no business switcher, no auth menu. Those land alongside the
// pages that need them in later phases.
export function OwnerShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">
            DT SaaS Owner Dashboard
          </h1>
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
            {/* Requests page is not implemented yet — placeholder only. */}
            <span
              aria-disabled="true"
              title="Coming soon"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground cursor-not-allowed select-none"
            >
              Requests
            </span>
          </nav>
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
