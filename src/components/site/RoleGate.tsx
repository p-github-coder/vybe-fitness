import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { useAccount, type AppRole } from "@/lib/auth";

/**
 * UI-level gate: requires the given role AND an approved account status.
 * Authorization is also enforced server-side by row level security and the
 * admin-only database function behind every approval action.
 */
export function RoleGate({ role, children }: { role: AppRole; children: ReactNode }) {
  const { loading, session, profile, hasRole } = useAccount();
  const navigate = useNavigate();

  const approved = profile?.account_status === "approved";
  const allowed = hasRole(role) && approved;

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!approved) {
      navigate({ to: "/status", replace: true });
      return;
    }
    if (!hasRole(role)) {
      navigate({ to: hasRole("trainer") ? "/trainer" : "/member", replace: true });
    }
  }, [loading, session, approved, hasRole, role, navigate]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
