import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  allPlansQuery,
  attendanceQuery,
  bookingsQuery,
  deleteRow,
  formatDate,
  fullName,
  initials,
  profilesQuery,
  rolesQuery,
  userMembershipsQuery,
  upsertRow,
  type AdminProfile,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_adminportal/admin/members")({
  head: head("Members", "Manage every VYBE Fitness member account."),
  component: MembersPage,
});

function MembersPage() {
  const queryClient = useQueryClient();
  const profiles = useQuery(profilesQuery);
  const roles = useQuery(rolesQuery);
  const memberships = useQuery(userMembershipsQuery);
  const plans = useQuery(allPlansQuery);
  const bookings = useQuery(bookingsQuery);
  const attendance = useQuery(attendanceQuery);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<AdminProfile | null>(null);
  const [editing, setEditing] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const memberIds = new Set((roles.data ?? []).filter((r) => r.role === "member").map((r) => r.user_id));
  const members = useMemo(
    () =>
      (profiles.data ?? [])
        .filter((p) => memberIds.has(p.user_id))
        .filter((p) => statusFilter === "all" || p.account_status === statusFilter)
        .filter((p) =>
          !search.trim()
            ? true
            : `${fullName(p)} ${p.email ?? ""}`.toLowerCase().includes(search.toLowerCase()),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profiles.data, roles.data, search, statusFilter],
  );

  const planName = (id: string | null) => plans.data?.find((p) => p.id === id)?.name ?? "—";
  const membershipFor = (userId: string) => memberships.data?.find((m) => m.user_id === userId) ?? null;

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await upsertRow(
        "profiles",
        {
          first_name: form["first_name"] || null,
          last_name: form["last_name"] || null,
          phone: form["phone"] || null,
          age: form["age"] ? Number(form["age"]) : null,
          gender: form["gender"] || null,
        },
        editing.id,
      );
      if (form["plan_id"]) {
        const existing = membershipFor(editing.user_id);
        await upsertRow(
          "user_memberships",
          { user_id: editing.user_id, plan_id: form["plan_id"], status: "active" },
          existing?.id,
        );
      }
    },
    onSuccess: async () => {
      toast.success("Member updated");
      setEditing(null);
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase.rpc("admin_set_account_status", {
        _user_id: userId,
        _status: status as "pending" | "approved" | "rejected" | "suspended",
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Status updated");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => deleteRow("profiles", id),
    onSuccess: async () => {
      toast.success("Member deleted");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage title="Members" description={`${members.length} member accounts`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "rejected", "suspended"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="surface-card mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-muted-foreground">No members found.</TableCell></TableRow>
            )}
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {m.profile_image && <AvatarImage src={m.profile_image} alt="" />}
                      <AvatarFallback>{initials(fullName(m))}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName(m)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.email ?? "—"}</TableCell>
                <TableCell>{planName(membershipFor(m.user_id)?.plan_id ?? null)}</TableCell>
                <TableCell><StatusBadge value={m.account_status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewing(m)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setForm({
                          first_name: m.first_name ?? "",
                          last_name: m.last_name ?? "",
                          phone: m.phone ?? "",
                          age: m.age ? String(m.age) : "",
                          gender: m.gender ?? "",
                          plan_id: membershipFor(m.user_id)?.plan_id ?? "",
                        });
                        setEditing(m);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStatus.mutate({
                          userId: m.user_id,
                          status: m.account_status === "suspended" ? "approved" : "suspended",
                        })
                      }
                    >
                      {m.account_status === "suspended" ? "Reinstate" : "Suspend"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => confirm("Delete this member record?") && removeMember.mutate(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{fullName(viewing)}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <Detail label="Email" value={viewing.email ?? "—"} />
              <Detail label="Phone" value={viewing.phone ?? "—"} />
              <Detail label="Age" value={viewing.age ? String(viewing.age) : "—"} />
              <Detail label="Gender" value={viewing.gender ?? "—"} />
              <Detail label="Membership" value={planName(membershipFor(viewing.user_id)?.plan_id ?? null)} />
              <Detail label="Status" value={viewing.account_status} />
              <Detail
                label="Bookings"
                value={String((bookings.data ?? []).filter((b) => b.member_id === viewing.user_id).length)}
              />
              <Detail
                label="Attendance records"
                value={String((attendance.data ?? []).filter((a) => a.member_id === viewing.user_id).length)}
              />
              <Detail label="Joined" value={formatDate(viewing.created_at)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[
              { k: "first_name", l: "First name" },
              { k: "last_name", l: "Last name" },
              { k: "phone", l: "Phone" },
              { k: "age", l: "Age" },
              { k: "gender", l: "Gender" },
            ].map((f) => (
              <div key={f.k} className="space-y-2">
                <Label htmlFor={f.k}>{f.l}</Label>
                <Input
                  id={f.k}
                  value={form[f.k] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Membership plan</Label>
              <Select value={form["plan_id"] ?? ""} onValueChange={(v) => setForm((s) => ({ ...s, plan_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Assign a plan" /></SelectTrigger>
                <SelectContent>
                  {(plans.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              {saveProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
