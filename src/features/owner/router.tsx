import { Navigate, type RouteObject } from "react-router";
import { OwnerShell } from "./_components/OwnerShell";
import { RequireOwnerAuth } from "./_components/RequireOwnerAuth";
import { useOwnerSessionStore } from "./_store/ownerSession";
import { OwnerLoginPage } from "./_pages/OwnerLoginPlaceholderPage";
import { OwnerHomePage } from "./_pages/OwnerHomePage";
import { OwnerRequestListPage } from "./_pages/OwnerRequestListPage";
import { OwnerRequestDetailPage } from "./_pages/OwnerRequestDetailPage";
import { SelectBusinessPage } from "./_pages/SelectBusinessPage";
import { BranchListPage } from "./_pages/BranchListPage";
import { BranchNewPage } from "./_pages/BranchNewPage";
import { BranchEditPage } from "./_pages/BranchEditPage";
import { CategoryListPage } from "./_pages/CategoryListPage";
import { CategoryNewPage } from "./_pages/CategoryNewPage";
import { CategoryEditPage } from "./_pages/CategoryEditPage";
import { ProductListPage } from "./_pages/ProductListPage";
import { ProductNewPage } from "./_pages/ProductNewPage";
import { ProductEditPage } from "./_pages/ProductEditPage";
import { BusinessListPage } from "./_pages/BusinessListPage";
import { BusinessNewPage } from "./_pages/BusinessNewPage";
import { BusinessEditPage } from "./_pages/BusinessEditPage";
import { OwnerAnalyticsPage } from "./_pages/OwnerAnalyticsPage";
import { OwnerReportsPage } from "./_pages/OwnerReportsPage";
import { OwnerSalesPage } from "./_pages/OwnerSalesPage";
import { OwnerInventoryPage } from "./_pages/OwnerInventoryPage";

// Sends each role to its natural home page.
// Renders null while the profile is loading so OwnerShell can trigger loadOwner()
// before the role is known.
function OwnerIndexRedirect() {
  const owner = useOwnerSessionStore((s) => s.owner);
  if (owner === null) return null;
  return (
    <Navigate
      to={owner.role === "SUPER_ADMIN" ? "/owner/home" : "/owner/analytics"}
      replace
    />
  );
}

// Route objects for the owner dashboard surface. Mounted by the top-level
// router in src/router.tsx. Future production target: dashboard.dtsaas.com.
//
// This file MUST NOT create its own <RouterProvider>, and MUST NOT be merged
// into digitalMenuRoutes.
//
// Role model:
//   SUPER_ADMIN — all pages (current owner system + future platform controls)
//   OWNER       — business operation pages only (analytics, categories, products,
//                 reports, sales, inventory)
export const ownerRoutes: RouteObject[] = [
  // /owner/login renders OUTSIDE the protected shell so an unauthenticated
  // user can reach it without redirect loops.
  {
    path: "/owner/login",
    element: <OwnerLoginPage />,
  },
  // Everything else under /owner is gated by RequireOwnerAuth and wrapped in
  // OwnerShell.
  {
    path: "/owner",
    element: (
      <RequireOwnerAuth>
        <OwnerShell />
      </RequireOwnerAuth>
    ),
    children: [
      // Index: wait for profile then send each role to its home page.
      { index: true, element: <OwnerIndexRedirect /> },

      // ── SUPER_ADMIN-only pages ──────────────────────────────────────────
      {
        path: "home",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <OwnerHomePage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "requests",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <OwnerRequestListPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "requests/:requestId",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <OwnerRequestDetailPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "branches",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BranchListPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "branches/new",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BranchNewPage />
          </RequireOwnerAuth>
        ),
      },
      {
        path: "branches/:branchId",
        element: (
          <RequireOwnerAuth allowedRoles={["SUPER_ADMIN"]}>
            <BranchEditPage />
          </RequireOwnerAuth>
        ),
      },
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

      // ── Accessible to both SUPER_ADMIN and OWNER ────────────────────────
      { path: "select-business", element: <SelectBusinessPage /> },
      { path: "categories", element: <CategoryListPage /> },
      { path: "categories/new", element: <CategoryNewPage /> },
      { path: "categories/:categoryId", element: <CategoryEditPage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/new", element: <ProductNewPage /> },
      { path: "products/:productId", element: <ProductEditPage /> },

      // ── OWNER placeholder pages (accessible to both roles) ──────────────
      { path: "analytics", element: <OwnerAnalyticsPage /> },
      { path: "reports", element: <OwnerReportsPage /> },
      { path: "sales", element: <OwnerSalesPage /> },
      { path: "inventory", element: <OwnerInventoryPage /> },
    ],
  },
];
