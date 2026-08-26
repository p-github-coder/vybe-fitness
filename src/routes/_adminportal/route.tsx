import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminGate } from "@/components/site/AdminGate";
import { AdminAuthProvider } from "@/lib/admin-auth";

export const Route = createFileRoute("/_adminportal")({
  ssr: false,
  component: AdminPortalRoot,
});

function AdminPortalRoot() {
  return (
    <AdminAuthProvider>
      <AdminGate>
        <Outlet />
      </AdminGate>
    </AdminAuthProvider>
  );
}
