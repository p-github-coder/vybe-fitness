import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { adminSupabase } from "@/integrations/supabase/admin-client";
import type { Profile } from "@/lib/auth";

interface AdminAuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authorized: boolean;
}

const AdminAuthContext = createContext<AdminAuthState>({
  session: null,
  profile: null,
  loading: true,
  authorized: false,
});

async function resolveAdminSession(session: Session | null): Promise<AdminAuthState> {
  if (!session) return { session: null, profile: null, loading: false, authorized: false };

  const [{ data: isAdmin, error: roleError }, { data: profile, error: profileError }] =
    await Promise.all([
      adminSupabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }),
      adminSupabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
    ]);

  if (roleError || profileError || !isAdmin) {
    await adminSupabase.auth.signOut({ scope: "local" });
    return { session: null, profile: null, loading: false, authorized: false };
  }

  return { session, profile: profile as Profile | null, loading: false, authorized: true };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    session: null,
    profile: null,
    loading: true,
    authorized: false,
  });

  useEffect(() => {
    let active = true;
    const apply = async (session: Session | null) => {
      const next = await resolveAdminSession(session);
      if (active) setState(next);
    };

    const { data: subscription } = adminSupabase.auth.onAuthStateChange((_event, session) => {
      void apply(session);
    });
    void adminSupabase.auth.getSession().then(({ data }) => apply(data.session));

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return <AdminAuthContext.Provider value={state}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
