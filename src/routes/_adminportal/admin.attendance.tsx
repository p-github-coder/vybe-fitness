import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceQuery, formatDate, fullName, profilesQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_adminportal/admin/attendance")({
  head: head("Attendance", "Review member attendance across VYBE Fitness."),
  component: AttendancePage,
});

function AttendancePage() {
  const attendance = useQuery(attendanceQuery);
  const profiles = useQuery(profilesQuery);
  const memberName = (userId: string) =>
    fullName(profiles.data?.find((profile) => profile.user_id === userId) ?? null);

  return (
    <AdminPage title="Attendance" description="Member check-ins and class attendance">
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(attendance.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">No attendance records yet.</TableCell>
              </TableRow>
            )}
            {(attendance.data ?? []).map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{memberName(record.member_id)}</TableCell>
                <TableCell>{formatDate(record.attended_on)}</TableCell>
                <TableCell><StatusBadge value={record.status} /></TableCell>
                <TableCell className="text-muted-foreground">{record.notes ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminPage>
  );
}