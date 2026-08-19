import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { useAccount } from "@/lib/auth";

/**
 * UI-level gate for the standalone admin portal. Anyone who is not an
 * authenticated administrator is sent to /admin/login. Authorization is also
 * enforced server-side by row level security and the admin-only database
 * functions behind every privileged action.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, session, hasRole } = useAccount();
  const navigate = useNavigate();
  const allowed = !!session && hasRole("admin");

  useEffect(() => {
    if (loading) return;
    if (!allowed) navigate({ to: "/admin/login", replace: true });
  }, [loading, allowed, navigate]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verifying administrator access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
