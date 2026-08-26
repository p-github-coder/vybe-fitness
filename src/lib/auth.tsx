import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

export type AccountStatus = "pending" | "approved" | "rejected" | "suspended";
export type AppRole = "member" | "trainer" | "admin";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  profile_image: string | null;
  account_status: AccountStatus;
  created_at: string;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

async function resolvePublicSession(session: Session | null) {
  if (!session) return null;
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id);
  if (error) return null;
  const publicRole = (roles ?? []).some((row) => row.role === "member" || row.role === "trainer");
  return publicRole ? session : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const apply = async (next: Session | null) => {
      const publicSession = await resolvePublicSession(next);
      if (!active) return;
      setSession(publicSession);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void apply(next);
    });
    supabase.auth.getSession().then(({ data }) => {
      void apply(data.session);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useAccount() {
  const { session, loading } = useAuth();
  const userId = session?.user.id ?? null;

  const query = useQuery({
    queryKey: ["account", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: profile, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      return {
        profile: (profile as Profile | null) ?? null,
        roles: (roles ?? []).map((r) => r.role as AppRole),
      };
    },
  });

  return {
    session,
    userId,
    loading: loading || (!!userId && query.isLoading),
    profile: query.data?.profile ?? null,
    roles: query.data?.roles ?? [],
    hasRole: (role: AppRole) => (query.data?.roles ?? []).includes(role),
  };
}

export function displayName(profile: Profile | null): string {
  if (!profile) return "there";
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "there";
}
