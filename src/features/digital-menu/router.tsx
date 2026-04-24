import { createBrowserRouter, Navigate } from "react-router";
import { DigitalMenuPage } from "./pages/DigitalMenuPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const digitalMenuRouter = createBrowserRouter([
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
]);
