import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { adminSupabase } from "@/integrations/supabase/admin-client";

export const Route = createFileRoute("/_adminportal")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await adminSupabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
