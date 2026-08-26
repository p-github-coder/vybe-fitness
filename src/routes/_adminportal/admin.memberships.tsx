import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager, StatusBadge } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  allPlansQuery,
  formatDate,
  fullName,
  profilesQuery,
  userMembershipsQuery,
} from "@/lib/admin-data";
import { formatPrice } from "@/lib/site-data";

export const Route = createFileRoute("/_adminportal/admin/memberships")({
  head: head("Memberships", "Create membership plans and track member subscriptions."),
  component: MembershipsPage,
});

function MembershipsPage() {
  const memberships = useQuery(userMembershipsQuery);
  const plans = useQuery(allPlansQuery);
  const profiles = useQuery(profilesQuery);

  const planName = (id: string | null) => plans.data?.find((p) => p.id === id)?.name ?? "—";
  const memberName = (userId: string) =>
    fullName(profiles.data?.find((p) => p.user_id === userId) ?? null);

  return (
    <AdminPage title="Memberships" description="Plans, pricing and active subscriptions">
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subs">Member subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <CrudManager
            table="membership_plans"
            query={allPlansQuery}
            entityLabel="Plan"
            searchKeys={["name", "tagline"]}
            columns={[
              { key: "name", header: "Plan", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "price", header: "Price", render: (r) => `${formatPrice(Number(r.price))} / ${r.period}` },
              { key: "duration", header: "Duration", render: (r) => `${r.duration_days} days` },
              { key: "access", header: "Access level", render: (r) => <Badge variant="secondary" className="capitalize">{r.access_level}</Badge> },
              { key: "features", header: "Features", render: (r) => <span className="line-clamp-1 text-muted-foreground">{(r.features ?? []).join(", ")}</span> },
              { key: "pub", header: "Visibility", render: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Hidden"}</Badge> },
            ]}
            fields={[
              { name: "name", label: "Plan name", type: "text" },
              { name: "tagline", label: "Tagline", type: "text" },
              { name: "price", label: "Price", type: "number", defaultValue: 0 },
              { name: "period", label: "Billing period", type: "select", options: ["month", "quarter", "year"].map((v) => ({ value: v, label: v })) },
              { name: "duration_days", label: "Duration (days)", type: "number", defaultValue: 30 },
              { name: "access_level", label: "Access level", type: "select", options: ["basic", "premium", "vip"].map((v) => ({ value: v, label: v })) },
              { name: "features", label: "Features", type: "array" },
              { name: "benefits", label: "Benefits", type: "array" },
              { name: "sort_order", label: "Sort order", type: "number", defaultValue: 0 },
              { name: "recommended", label: "Recommended", type: "boolean", defaultValue: false },
              { name: "published", label: "Published", type: "boolean", defaultValue: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="subs" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(memberships.data ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground">No memberships assigned yet — assign one from the Members page.</TableCell></TableRow>
                )}
                {(memberships.data ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{memberName(m.user_id)}</TableCell>
                    <TableCell>{planName(m.plan_id)}</TableCell>
                    <TableCell><StatusBadge value={m.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(m.started_on)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(m.expires_on)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
