import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccount } from "@/lib/auth";
import { adminClassesQuery, bookingsQuery, formatDate, fullName, profilesQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/classes")({
  head: head("My classes", "The classes you lead and who is booked in."),
  component: TrainerClasses,
});

function TrainerClasses() {
  const { userId, profile } = useAccount();
  const classes = useQuery(adminClassesQuery);
  const bookings = useQuery(bookingsQuery);
  const profiles = useQuery(profilesQuery);

  const myClasses = (classes.data ?? []).filter(
    (c) => c.trainer_id === userId || c.trainer === fullName(profile),
  );

  return (
    <TrainerPage title="My classes" description={`${myClasses.length} classes assigned to you`}>
      <div className="space-y-6">
        {myClasses.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes assigned to you yet.</p>
        )}
        {myClasses.map((c) => {
          const list = (bookings.data ?? []).filter((b) => b.class_id === c.id);
          return (
            <div key={c.id} className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {c.schedule ?? "Unscheduled"} · {c.duration_minutes} min · capacity {c.capacity}
                  </p>
                </div>
                <Badge variant="secondary">{list.length} booked</Badge>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-muted-foreground">No bookings yet.</TableCell></TableRow>
                    )}
                    {list.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{fullName(profiles.data?.find((p) => p.user_id === b.member_id) ?? null)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(b.booking_date)}</TableCell>
                        <TableCell className="text-muted-foreground">{b.booking_time ?? "—"}</TableCell>
                        <TableCell><StatusBadge value={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </TrainerPage>
  );
}
