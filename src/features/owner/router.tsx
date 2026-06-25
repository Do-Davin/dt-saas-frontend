import { Navigate, type RouteObject } from "react-router";
import { OwnerShell } from "./_components/OwnerShell";
import { RequireOwnerAuth } from "./_components/RequireOwnerAuth";
import { useOwnerSessionStore } from "./_store/ownerSession";
import { OwnerLoginPage } from "./_pages/OwnerLoginPlaceholderPage";
import { OwnerHomePage } from "./_pages/OwnerHomePage";
import { SelectBusinessPage } from "./_pages/SelectBusinessPage";
import { CategoryListPage } from "./_pages/CategoryListPage";
import { CategoryNewPage } from "./_pages/CategoryNewPage";
import { CategoryEditPage } from "./_pages/CategoryEditPage";
import { ProductListPage } from "./_pages/ProductListPage";
import { ProductNewPage } from "./_pages/ProductNewPage";
import { ProductEditPage } from "./_pages/ProductEditPage";
import { BusinessListPage } from "./_pages/BusinessListPage";
import { BusinessNewPage } from "./_pages/BusinessNewPage";
import { BusinessEditPage } from "./_pages/BusinessEditPage";
import { AdminSubscriptionsPage } from "./_pages/AdminSubscriptionsPage";
import { AdminAnalyticsPage } from "./_pages/AdminAnalyticsPage";
import { OwnerAnalyticsPage } from "./_pages/OwnerAnalyticsPage";
import { OwnerReportsPage } from "./_pages/OwnerReportsPage";
import { OwnerSalesPage } from "./_pages/OwnerSalesPage";
import { OwnerStockPage } from "./_pages/OwnerStockPage";

// Waits for the session profile, then sends each role to its home page.
function OwnerIndexRedirect() {
  const owner = useOwnerSessionStore((s) => s.owner);
  if (owner === null) return null;
  return (
    <Navigate
      to={owner.role === "SUPER_ADMIN" ? "/admin/home" : "/owner/analytics"}
      replace
    />
  );
}

// Route objects for the owner + admin surfaces. Mounted by src/router.tsx.
//
// Role model:
//   OWNER       — /owner/* only (analytics, categories, products, reports, sales, stock)
//   SUPER_ADMIN — /admin/* only (home, businesses)
//
// This file MUST NOT create its own <RouterProvider>.
export const ownerRoutes: RouteObject[] = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    path: "/login",
    element: <OwnerLoginPage />,
  },
  // Legacy redirect — old bookmarks or 401 redirects land here
  {
    path: "/owner/login",
    element: <Navigate to="/login" replace />,
  },

  // ── OWNER surface (/owner/*) ─────────────────────────────────────────────
  // Authenticated users reach this shell; OwnerIndexRedirect sends SUPER_ADMIN
  // to /admin/home so they never need /owner/* navigation.
  {
    path: "/owner",
    element: (
      <RequireOwnerAuth>
        <OwnerShell />
      </RequireOwnerAuth>
    ),
    children: [
      { index: true, element: <OwnerIndexRedirect /> },
      { path: "select-business", element: <SelectBusinessPage /> },
      { path: "analytics",       element: <OwnerAnalyticsPage /> },
      { path: "categories",      element: <CategoryListPage /> },
      { path: "categories/new",  element: <CategoryNewPage /> },
      { path: "categories/:categoryId", element: <CategoryEditPage /> },
      { path: "products",        element: <ProductListPage /> },
      { path: "products/new",    element: <ProductNewPage /> },
      { path: "products/:productId", element: <ProductEditPage /> },
      { path: "reports",         element: <OwnerReportsPage /> },
      { path: "sales",           element: <OwnerSalesPage /> },
      { path: "stock",           element: <OwnerStockPage /> },
      { path: "inventory",       element: <Navigate to="/owner/stock" replace /> },
    ],
  },

  // ── SUPER_ADMIN surface (/admin/*) ────────────────────────────────────────
  // All children are individually gated with allowedRoles={["SUPER_ADMIN"]}
  // so an OWNER who manually navigates here is redirected to /owner/analytics.
  {
    path: "/admin",
    element: (
      <RequireOwnerAuth>
        <OwnerShell />
      </RequireOwnerAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/home" replace /> },
      {
        path: "home",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <OwnerHomePage />
          </RequireOwnerAuth>
        ),
      },
      { path: "select-business", element: <SelectBusinessPage /> },
      {
        path: "businesses",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BusinessListPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "businesses/new",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BusinessNewPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "businesses/:businessId",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BusinessEditPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <AdminSubscriptionsPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "analytics",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <AdminAnalyticsPage />
          </RequireOwnerAuth>
        ),
      },
    ],
  },
];
