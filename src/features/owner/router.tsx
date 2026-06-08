import { Navigate, type RouteObject } from "react-router";
import { OwnerShell } from "./_components/OwnerShell";
import { RequireOwnerAuth } from "./_components/RequireOwnerAuth";
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

// Route objects for the owner dashboard surface. Mounted by the top-level
// router in src/router.tsx. Future production target: dashboard.dtsaas.com.
//
// This file MUST NOT create its own <RouterProvider>, and MUST NOT be merged
// into digitalMenuRoutes.
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
      { index: true, element: <Navigate to="/owner/home" replace /> },
      { path: "home", element: <OwnerHomePage /> },
      { path: "requests", element: <OwnerRequestListPage /> },
      { path: "requests/:requestId", element: <OwnerRequestDetailPage /> },
      { path: "select-business", element: <SelectBusinessPage /> },
      { path: "branches", element: <BranchListPage /> },
      { path: "branches/new", element: <BranchNewPage /> },
      { path: "branches/:branchId", element: <BranchEditPage /> },
      { path: "categories", element: <CategoryListPage /> },
      { path: "categories/new", element: <CategoryNewPage /> },
      { path: "categories/:categoryId", element: <CategoryEditPage /> },
    ],
  },
];
