import { createFileRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AdminGate } from "@/components/site/AdminGate";
import { AdminAuthProvider } from "@/lib/admin-auth";

export const Route = createFileRoute("/_adminportal")({
  ssr: false,
  component: AdminPortalRoot,
});

function AdminPortalRoot() {
  const [adminQueryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={adminQueryClient}>
      <AdminAuthProvider>
        <AdminGate>
          <Outlet />
        </AdminGate>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
