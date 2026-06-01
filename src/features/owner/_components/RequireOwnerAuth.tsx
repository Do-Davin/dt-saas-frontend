import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useOwnerAuthStore } from "../_store/ownerAuth";

interface RequireOwnerAuthProps {
  children?: ReactNode;
}

// Protected-route guard for the owner dashboard surface.
// Synchronous token-presence check only — no backend call, no async logic.
// Reads from the Zustand auth store so the component re-renders automatically
// when the token is cleared (e.g. 401 auto-logout, future logout button)
// without requiring a manual page reload to trigger the redirect.
// Supports both wrap-style (<RequireOwnerAuth><Shell/></RequireOwnerAuth>)
// and layout-route usage (children omitted → renders <Outlet />).
export function RequireOwnerAuth({ children }: RequireOwnerAuthProps) {
  const token = useOwnerAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/owner/login" replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}
