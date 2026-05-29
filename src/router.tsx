import { createBrowserRouter } from "react-router";
import { digitalMenuRoutes } from "./features/digital-menu";

/**
 * Top-level app router.
 *
 * Production app-surface boundary (see docs/production-app-boundaries.md):
 * DT SaaS is planned to ship as three separate app surfaces, each on its
 * own subdomain and its own build:
 *   - catalog.dtsaas.com    → public Catalog / Digital Menu app
 *   - dashboard.dtsaas.com  → Business Owner Dashboard app
 *   - admin.dtsaas.com      → internal DT SaaS Admin app
 *
 * Surfaces MUST NOT be merged into one domain that swaps behavior after
 * login. When owner and admin work begins, each surface gets its own router
 * and entry point (planned: src/apps/dashboard/, src/apps/admin/) — do not
 * add their routes to this file.
 *
 * For now this is the catalog surface router. Features contribute a
 * `RouteObject[]` array (e.g. digitalMenuRoutes) and never mount their own
 * <RouterProvider>.
 */
export const appRouter = createBrowserRouter([
  // ── catalog surface (future host: catalog.dtsaas.com) ──────────────────
  ...digitalMenuRoutes,

  // ── owner dashboard surface (future host: dashboard.dtsaas.com) ────────
  // Lives in its own router/entry once introduced. Do not add owner routes here.

  // ── admin surface (future host: admin.dtsaas.com) ──────────────────────
  // Lives in its own router/entry once introduced. Do not add admin routes here.
]);
