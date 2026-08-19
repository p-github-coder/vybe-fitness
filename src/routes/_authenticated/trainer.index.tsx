import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/auth";
import {
  adminClassesQuery,
  assignmentsQuery,
  attendanceQuery,
  bookingsQuery,
  formatDate,
  fullName,
  profilesQuery,
  workoutPlansQuery,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/")({
  head: head("Trainer dashboard", "Your members, classes and schedule at a glance."),
  component: TrainerHome,
});

function TrainerHome() {
  const { userId, profile } = useAccount();
  const assignments = useQuery(assignmentsQuery);
  const profiles = useQuery(profilesQuery);
  const classes = useQuery(adminClassesQuery);
  const bookings = useQuery(bookingsQuery);
  const attendance = useQuery(attendanceQuery);
  const plans = useQuery(workoutPlansQuery);

  const myMembers = (assignments.data ?? []).filter((a) => a.trainer_id === userId);
  const myClasses = (classes.data ?? []).filter(
    (c) => c.trainer_id === userId || c.trainer === fullName(profile),
  );
  const myClassIds = new Set(myClasses.map((c) => c.id));
  const myBookings = (bookings.data ?? []).filter((b) => myClassIds.has(b.class_id));
  const myAttendance = (attendance.data ?? []).filter((a) => a.trainer_id === userId);
  const myPlans = (plans.data ?? []).filter((p) => p.trainer_id === userId);

  const memberName = (id: string) => fullName(profiles.data?.find((p) => p.user_id === id) ?? null);

  return (
    <TrainerPage
      title={`Welcome, ${fullName(profile)}`}
      description="Everything you're coaching this week"
      actions={
        <Button asChild size="sm">
          <Link to="/trainer/plans">Create workout plan</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned members" value={myMembers.length} />
        <StatCard label="My classes" value={myClasses.length} />
        <StatCard label="Upcoming bookings" value={myBookings.filter((b) => b.status === "confirmed").length} />
        <StatCard label="Workout plans" value={myPlans.length} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Upcoming sessions</h2>
          <ul className="mt-4 space-y-3">
            {myBookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{classes.data?.find((c) => c.id === b.class_id)?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {memberName(b.member_id)} · {formatDate(b.booking_date)} {b.booking_time ?? ""}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">{b.status}</Badge>
              </li>
            ))}
            {myBookings.length === 0 && <li className="text-sm text-muted-foreground">No bookings yet.</li>}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Recent attendance</h2>
          <ul className="mt-4 space-y-3">
            {myAttendance.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{memberName(a.member_id)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(a.attended_on)} · <span className="capitalize">{a.status}</span>
                </span>
              </li>
            ))}
            {myAttendance.length === 0 && <li className="text-sm text-muted-foreground">No check-ins recorded.</li>}
          </ul>
        </div>
      </div>
    </TrainerPage>
  );
}
