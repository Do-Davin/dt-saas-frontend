export function OwnerLoginPlaceholderPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          DT SaaS Owner Login
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Owner login is not implemented yet. A real sign-in form will be added
          in a later phase.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          During local development only, an owner token can be set manually in
          browser storage to access the protected dashboard placeholder. This
          path is for developers and will be removed once real login ships.
        </p>
      </div>
    </div>
  );
}
