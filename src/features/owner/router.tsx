import { Navigate, type RouteObject } from "react-router";
import { OwnerShell } from "./_components/OwnerShell";
import { RequireOwnerAuth } from "./_components/RequireOwnerAuth";
import { OwnerLoginPlaceholderPage } from "./_pages/OwnerLoginPlaceholderPage";
import { OwnerHomePage } from "./_pages/OwnerHomePage";
import { OwnerRequestListPage } from "./_pages/OwnerRequestListPage";

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
    element: <OwnerLoginPlaceholderPage />,
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
    ],
  },
];
