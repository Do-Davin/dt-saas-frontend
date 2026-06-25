import { createBrowserRouter } from "react-router";
import { digitalMenuRoutes } from "./features/digital-menu";
import { ownerRoutes } from "./features/owner/router";
import { onboardingRoutes } from "./features/onboarding/router";

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
 * login. When admin work begins, it gets its own router and entry point
 * (planned: src/apps/admin/) — do not add its routes here.
 *
 * Today, owner routes live alongside catalog routes in this single router
 * for local development convenience. In production, owner routes belong on
 * dashboard.dtsaas.com and must split into their own entry point — see
 * docs/production-app-boundaries.md.
 *
 * Features contribute a `RouteObject[]` array (e.g. digitalMenuRoutes,
 * ownerRoutes) and never mount their own <RouterProvider>.
 *
 * Ordering note: digitalMenuRoutes ends with a `*` catch-all that renders
 * NotFoundPage. React Router 7 ranks more-specific paths above `*`, so the
 * `/owner/...` routes still match correctly. If a deeper owner path
 * collision ever appears, move the `*` out of digitalMenuRoutes and place
 * it explicitly at the end of this array.
 */
export const appRouter = createBrowserRouter([
  // ── catalog surface (future host: catalog.dtsaas.com) ──────────────────
  ...digitalMenuRoutes,

  // ── owner dashboard surface (future host: dashboard.dtsaas.com) ────────
  // Lives here for local dev; planned to move to src/apps/dashboard/ with its
  // own entry point when production deployment splits subdomains.
  ...ownerRoutes,

  // ── public onboarding surface (/subscribe, /subscribe/onboard) ─────────
  // No auth required. Demo-only until Milestone 7 wires the backend.
  ...onboardingRoutes,

  // ── admin surface (future host: admin.dtsaas.com) ──────────────────────
  // Lives in its own router/entry once introduced. Do not add admin routes here.
]);
