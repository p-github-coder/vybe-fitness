import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccount } from "@/lib/auth";
import {
  assignmentsQuery,
  attendanceQuery,
  formatDate,
  fullName,
  profilesQuery,
  workoutPlansQuery,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/members")({
  head: head("My members", "The members assigned to you and their progress."),
  component: TrainerMembers,
});

function TrainerMembers() {
  const { userId } = useAccount();
  const assignments = useQuery(assignmentsQuery);
  const profiles = useQuery(profilesQuery);
  const attendance = useQuery(attendanceQuery);
  const plans = useQuery(workoutPlansQuery);
  const [search, setSearch] = useState("");

  const myMemberIds = (assignments.data ?? [])
    .filter((a) => a.trainer_id === userId)
    .map((a) => a.member_id);

  const rows = (profiles.data ?? [])
    .filter((p) => myMemberIds.includes(p.user_id))
    .filter((p) => fullName(p).toLowerCase().includes(search.toLowerCase()));

  return (
    <TrainerPage title="My members" description={`${rows.length} assigned members`}>
      <Input
        placeholder="Search members…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-ins</TableHead>
              <TableHead>Plans</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-muted-foreground">No members assigned yet — an admin can assign members to you.</TableCell></TableRow>
            )}
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{fullName(m)}</TableCell>
                <TableCell className="text-muted-foreground">{m.email ?? "—"}</TableCell>
                <TableCell><StatusBadge value={m.account_status} /></TableCell>
                <TableCell>{(attendance.data ?? []).filter((a) => a.member_id === m.user_id).length}</TableCell>
                <TableCell>{(plans.data ?? []).filter((p) => p.member_id === m.user_id).length}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(m.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TrainerPage>
  );
}
