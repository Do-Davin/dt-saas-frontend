import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { hasOwnerToken } from "../_auth/ownerToken";

interface RequireOwnerAuthProps {
  children?: ReactNode;
}

// Protected-route stub for the owner dashboard surface.
// Guards on token presence ONLY — does not decode the JWT, validate signature,
// or call /auth/me. A real auth check belongs on the backend per request; this
// guard exists so the route shell can refuse to render before a real login
// flow exists. Supports both wrap-style usage (<RequireOwnerAuth><Shell/></...>)
// and layout-route usage (children omitted → renders <Outlet />).
export function RequireOwnerAuth({ children }: RequireOwnerAuthProps) {
  if (!hasOwnerToken()) {
    return <Navigate to="/owner/login" replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}
