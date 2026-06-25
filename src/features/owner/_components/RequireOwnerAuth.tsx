import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useOwnerAuthStore } from "../_store/ownerAuth";
import { useOwnerSessionStore } from "../_store/ownerSession";
import type { OwnerRole } from "../_api/auth";

interface RequireOwnerAuthProps {
  children?: ReactNode;
  // When provided, the authenticated owner's role must be in this list.
  // The check is deferred until the owner profile finishes loading so that
  // a null profile on first render does not cause a premature redirect.
  allowedRoles?: OwnerRole[];
}

// Protected-route guard for the owner dashboard surface.
//
// Without allowedRoles: synchronous token-presence check only (original behavior).
// With allowedRoles:    waits for the owner profile from ownerSession before
//   checking the role. While the profile is still loading (owner === null),
//   renders null so the OwnerShell parent keeps the layout stable. Once loaded,
//   redirects to /owner/analytics if the role is not permitted.
//
// OwnerShell calls loadOwner() on mount. Because it is always the parent of any
// route that uses allowedRoles, the profile will resolve without extra callers.
export function RequireOwnerAuth({ children, allowedRoles }: RequireOwnerAuthProps) {
  const token = useOwnerAuthStore((s) => s.token);
  const owner = useOwnerSessionStore((s) => s.owner);

  if (!token) {
    return <Navigate to="/owner/login" replace />;
  }

  if (allowedRoles) {
    // Profile not loaded yet — defer until OwnerShell's loadOwner() resolves.
    if (owner === null) return null;
    if (!allowedRoles.includes(owner.role)) {
      return <Navigate to="/owner/analytics" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
