import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/site/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminSupabase } from "@/integrations/supabase/admin-client";
import { type AccountStatus, type Profile } from "@/lib/auth";

export const Route = createFileRoute("/_adminportal/admin/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Console — VYBE Fitness Admin" },
      { name: "description", content: "Review and action pending VYBE Fitness member and trainer applications." },
      { property: "og:title", content: "Approval Console — VYBE Fitness" },
      { property: "og:description", content: "Admin approval console." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminApprovals,
});

interface TrainerDetail {
  user_id: string | null;
  years_of_experience: number;
  certifications: string[];
  specialties: string[];
  areas_of_expertise: string[];
  profile_image: string | null;
}

interface ApprovalEvent {
  id: string;
  affected_user: string;
  admin_user: string;
  action: string;
  created_at: string;
}

function AdminApprovals() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AccountStatus>("pending");

  const queue = useQuery({
    queryKey: ["admin-queue", statusFilter],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: trainers, error: tErr }, { data: roles, error: rErr }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("account_status", statusFilter)
            .order("created_at", { ascending: true }),
          supabase
            .from("trainer_profiles")
            .select("user_id, years_of_experience, certifications, specialties, areas_of_expertise, profile_image")
            .not("user_id", "is", null),
          adminSupabase.from("user_roles").select("user_id, role"),
        ]);
      if (error) throw error;
      if (tErr) throw tErr;
      if (rErr) throw rErr;
      return {
        profiles: (profiles ?? []) as Profile[],
        trainers: (trainers ?? []) as TrainerDetail[],
        roles: (roles ?? []) as { user_id: string; role: string }[],
      };
    },
  });

  const audit = useQuery({
    queryKey: ["approval-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_events")
        .select("id, affected_user, admin_user, action, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data ?? []) as ApprovalEvent[];
    },
  });

  const action = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: AccountStatus }) => {
      const { error } = await adminSupabase.rpc("admin_set_account_status", {
        _user_id: userId,
        _status: status,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Account updated and recorded in the audit trail.");
      await queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      await queryClient.invalidateQueries({ queryKey: ["approval-events"] });
    },
    onError: () => toast.error("That action could not be completed. Admin access is required."),
  });

  const roleOf = (userId: string) =>
    queue.data?.roles.find((r) => r.user_id === userId)?.role ?? "member";
  const trainerOf = (userId: string) => queue.data?.trainers.find((t) => t.user_id === userId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Logo className="mb-8" />
        <p className="text-eyebrow">Admin</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">Approval console</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Review member and trainer applications. Every action is recorded in the audit trail and
          enforced server-side.
        </p>

        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AccountStatus)}
          className="mt-8"
        >
          <TabsList className="flex-wrap">
            {(["pending", "approved", "rejected", "suspended"] as AccountStatus[]).map((status) => (
              <TabsTrigger key={status} value={status} className="capitalize">
                {status}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6 space-y-4">
            {queue.isLoading ? (
              [0, 1].map((i) => <Skeleton key={i} className="h-52 rounded-2xl" />)
            ) : (queue.data?.profiles.length ?? 0) === 0 ? (
              <p className="surface-card p-8 text-sm text-muted-foreground">
                Nothing in the {statusFilter} queue right now.
              </p>
            ) : (
              queue.data?.profiles.map((profile) => {
                const role = roleOf(profile.user_id);
                const trainer = role === "trainer" ? trainerOf(profile.user_id) : undefined;
                return (
                  <article key={profile.id} className="surface-card p-6">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        {trainer?.profile_image && (
                          <img
                            src={trainer.profile_image}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">
                            {[profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
                              profile.username}
                          </h2>
                          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {role}
                        </Badge>
                        <Badge className="capitalize">{profile.account_status}</Badge>
                      </div>
                    </div>

                    <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                      <Detail label="Phone">{profile.phone ?? "—"}</Detail>
                      <Detail label="Age">{profile.age ?? "—"}</Detail>
                      <Detail label="Registered">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </Detail>
                      {role === "member" && <Detail label="Gender">{profile.gender || "—"}</Detail>}
                      {trainer && (
                        <>
                          <Detail label="Experience">{trainer.years_of_experience} years</Detail>
                          <Detail label="Certifications">{trainer.certifications.join(", ") || "—"}</Detail>
                          <Detail label="Specialties">{trainer.specialties.join(", ") || "—"}</Detail>
                          <Detail label="Areas of expertise">
                            {trainer.areas_of_expertise.join(", ") || "—"}
                          </Detail>
                        </>
                      )}
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={action.isPending || profile.account_status === "approved"}
                        onClick={() => action.mutate({ userId: profile.user_id, status: "approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={action.isPending || profile.account_status === "rejected"}
                        onClick={() => action.mutate({ userId: profile.user_id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={action.isPending || profile.account_status === "suspended"}
                        onClick={() => action.mutate({ userId: profile.user_id, status: "suspended" })}
                      >
                        Suspend
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <section className="mt-14">
          <h2 className="text-display text-2xl">Audit trail</h2>
          <div className="surface-card mt-5 divide-y divide-border">
            {(audit.data ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No approval actions recorded yet.</p>
            ) : (
              audit.data?.map((event) => (
                <div key={event.id} className="grid gap-1 p-5 text-sm sm:grid-cols-[1fr_auto]">
                  <p>
                    <span className="font-medium capitalize">{event.action}</span>
                    <span className="text-muted-foreground"> · user {event.affected_user.slice(0, 8)}…</span>
                    <span className="text-muted-foreground"> by admin {event.admin_user.slice(0, 8)}…</span>
                  </p>
                  <p className="text-muted-foreground sm:text-right">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 break-words">{children}</dd>
    </div>
  );
}
