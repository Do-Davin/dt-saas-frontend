import { Navigate, type RouteObject } from "react-router";
import { DigitalMenuPage } from "./_pages/DigitalMenuPage";
import { NotFoundPage } from "./_pages/NotFoundPage";

// Route objects for the public Catalog / Digital Menu feature.
// Mounted by the top-level catalog app router in src/router.tsx.
// This file must NOT create its own <RouterProvider>.
export const digitalMenuRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/menu/dt-kitchen" replace />,
  },
  {
    path: "/menu",
    element: <Navigate to="/menu/dt-kitchen" replace />,
  },
  {
    path: "/menu/:businessSlug",
    element: <DigitalMenuPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
