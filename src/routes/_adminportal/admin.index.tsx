import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck, CreditCard, Percent, UserCheck, UserCog, Users } from "lucide-react";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminClassesQuery,
  allPlansQuery,
  attendanceQuery,
  bookingsQuery,
  formatDate,
  fullName,
  profilesQuery,
  rolesQuery,
  userMembershipsQuery,
} from "@/lib/gym-data";
import { formatPrice } from "@/lib/site-data";

export const Route = createFileRoute("/_adminportal/admin/")({
  head: head("Admin Dashboard", "Gym operations overview for VYBE Fitness administrators."),
  component: AdminHome,
});

const chartAxis = { stroke: "hsl(var(--muted-foreground))", fontSize: 12 };

function AdminHome() {
  const profiles = useQuery(profilesQuery);
  const roles = useQuery(rolesQuery);
  const classes = useQuery(adminClassesQuery);
  const bookings = useQuery(bookingsQuery);
  const attendance = useQuery(attendanceQuery);
  const memberships = useQuery(userMembershipsQuery);
  const plans = useQuery(allPlansQuery);

  const roleList = roles.data ?? [];
  const allProfiles = profiles.data ?? [];
  const memberIds = new Set(roleList.filter((r) => r.role === "member").map((r) => r.user_id));
  const trainerIds = new Set(roleList.filter((r) => r.role === "trainer").map((r) => r.user_id));

  const members = allProfiles.filter((p) => memberIds.has(p.user_id));
  const trainers = allProfiles.filter((p) => trainerIds.has(p.user_id));
  const pending = allProfiles.filter((p) => p.account_status === "pending");
  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = (bookings.data ?? []).filter((b) => b.booking_date === today);
  const activeMemberships = (memberships.data ?? []).filter((m) => m.status === "active");

  const attendanceRows = attendance.data ?? [];
  const attendanceRate = attendanceRows.length
    ? Math.round((attendanceRows.filter((a) => a.status === "present").length / attendanceRows.length) * 100)
    : 0;

  const growth = buildGrowth(allProfiles.map((p) => p.created_at));

  const classNameById = new Map((classes.data ?? []).map((c) => [c.id, c.name]));
  const bookingCounts = new Map<string, number>();
  for (const b of bookings.data ?? []) {
    const key = classNameById.get(b.class_id) ?? "Unknown";
    bookingCounts.set(key, (bookingCounts.get(key) ?? 0) + 1);
  }
  const popularClasses = [...bookingCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const planPrice = new Map((plans.data ?? []).map((p) => [p.id, Number(p.price)]));
  const revenue = activeMemberships.reduce((sum, m) => sum + (planPrice.get(m.plan_id ?? "") ?? 0), 0);

  const trainerBookings = new Map<string, number>();
  for (const b of bookings.data ?? []) {
    const cls = (classes.data ?? []).find((c) => c.id === b.class_id);
    const name = cls?.trainer ?? "Unassigned";
    trainerBookings.set(name, (trainerBookings.get(name) ?? 0) + 1);
  }
  const topTrainers = [...trainerBookings.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AdminPage
      title="Dashboard"
      description="Everything happening across the gym today"
      actions={
        <Button asChild size="sm">
          <Link to="/admin/approvals">Review approvals</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value={members.length} icon={Users} hint={`${allProfiles.length} accounts total`} />
        <StatCard label="Active memberships" value={activeMemberships.length} icon={CreditCard} hint={formatPrice(revenue) + " recurring"} />
        <StatCard label="Pending applications" value={pending.length} icon={UserCheck} hint="Awaiting review" />
        <StatCard label="Approved trainers" value={trainers.filter((t) => t.account_status === "approved").length} icon={UserCog} />
        <StatCard label="Total classes" value={(classes.data ?? []).length} icon={CalendarCheck} />
        <StatCard label="Today's bookings" value={todaysBookings.length} icon={CalendarCheck} hint={formatDate(today)} />
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} icon={Percent} hint={`${attendanceRows.length} records`} />
        <StatCard label="Revenue overview" value={formatPrice(revenue)} icon={CreditCard} hint="From active plans" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Member growth</h2>
          <p className="text-xs text-muted-foreground">New accounts per month</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Popular classes</h2>
          <p className="text-xs text-muted-foreground">Bookings per class</p>
          <div className="mt-4 h-64">
            {popularClasses.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">No bookings recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularClasses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" {...chartAxis} />
                  <YAxis allowDecimals={false} {...chartAxis} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Most booked trainers</h2>
          <ul className="mt-4 space-y-3">
            {topTrainers.length === 0 && <li className="text-sm text-muted-foreground">No booking data yet.</li>}
            {topTrainers.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between text-sm">
                <span>{name}</span>
                <Badge variant="secondary">{count} bookings</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Latest applications</h2>
          <ul className="mt-4 space-y-3">
            {pending.slice(0, 6).length === 0 && (
              <li className="text-sm text-muted-foreground">Nothing waiting for review.</li>
            )}
            {pending.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{fullName(p)}</span>
                <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminPage>
  );
}

function buildGrowth(dates: string[]) {
  const months: { key: string; month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      count: 0,
    });
  }
  for (const raw of dates) {
    const d = new Date(raw);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  }
  return months;
}
