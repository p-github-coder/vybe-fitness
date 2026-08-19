import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccount } from "@/lib/auth";
import {
  adminClassesQuery,
  assignmentsQuery,
  attendanceQuery,
  formatDate,
  fullName,
  profilesQuery,
  upsertRow,
  type AttendanceStatus,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/attendance")({
  head: head("Attendance", "Record and review attendance for your members."),
  component: TrainerAttendance,
});

function TrainerAttendance() {
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const attendance = useQuery(attendanceQuery);
  const assignments = useQuery(assignmentsQuery);
  const profiles = useQuery(profilesQuery);
  const classes = useQuery(adminClassesQuery);
  const [memberId, setMemberId] = useState("");
  const [classId, setClassId] = useState("");

  const myMembers = (profiles.data ?? []).filter((p) =>
    (assignments.data ?? []).some((a) => a.trainer_id === userId && a.member_id === p.user_id),
  );
  const myRecords = (attendance.data ?? []).filter(
    (a) => a.trainer_id === userId || myMembers.some((m) => m.user_id === a.member_id),
  );

  const record = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      if (!memberId) throw new Error("Choose a member first");
      await upsertRow("attendance", {
        member_id: memberId,
        trainer_id: userId,
        class_id: classId || null,
        status,
      });
    },
    onSuccess: async () => {
      toast.success("Attendance recorded");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <TrainerPage title="Attendance" description="Check members in and track consistency">
      <div className="surface-card mb-6 flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-52 flex-1">
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              {myMembers.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>{fullName(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-52 flex-1">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue placeholder="Class (optional)" /></SelectTrigger>
            <SelectContent>
              {(classes.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => record.mutate("present")}>Present</Button>
          <Button variant="secondary" onClick={() => record.mutate("late")}>Late</Button>
          <Button variant="ghost" onClick={() => record.mutate("absent")}>Absent</Button>
        </div>
      </div>

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myRecords.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-muted-foreground">Nothing recorded yet.</TableCell></TableRow>
            )}
            {myRecords.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  {fullName(profiles.data?.find((p) => p.user_id === a.member_id) ?? null)}
                </TableCell>
                <TableCell>{classes.data?.find((c) => c.id === a.class_id)?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(a.attended_on)}</TableCell>
                <TableCell><StatusBadge value={a.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TrainerPage>
  );
}
