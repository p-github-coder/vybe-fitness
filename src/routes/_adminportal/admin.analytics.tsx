import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { StatCard } from "@/components/dashboard/DashboardShell";
import {
  adminClassesQuery,
  allPlansQuery,
  attendanceQuery,
  bookingsQuery,
  profilesQuery,
  userMembershipsQuery,
} from "@/lib/gym-data";
import { formatPrice } from "@/lib/site-data";

export const Route = createFileRoute("/_adminportal/admin/analytics")({
  head: head("Analytics", "Revenue, attendance and class performance analytics."),
  component: AnalyticsPage,
});

const COLORS = ["hsl(var(--chart-1, 84 80% 55%))", "#7ee787", "#4dd6e8", "#f2c94c", "#f2994a"];

function monthKey(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function AnalyticsPage() {
  const profiles = useQuery(profilesQuery);
  const bookings = useQuery(bookingsQuery);
  const attendance = useQuery(attendanceQuery);
  const classes = useQuery(adminClassesQuery);
  const memberships = useQuery(userMembershipsQuery);
  const plans = useQuery(allPlansQuery);

  const signupSeries = Object.entries(
    (profiles.data ?? []).reduce<Record<string, number>>((acc, p) => {
      const k = monthKey(p.created_at);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([month, members]) => ({ month, members }));

  const bookingSeries = Object.entries(
    (bookings.data ?? []).reduce<Record<string, number>>((acc, b) => {
      const k = monthKey(b.booking_date);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([month, count]) => ({ month, bookings: count }));

  const classPopularity = (classes.data ?? [])
    .map((c) => ({
      name: c.name,
      bookings: (bookings.data ?? []).filter((b) => b.class_id === c.id).length,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  const planSplit = (plans.data ?? []).map((p) => ({
    name: p.name,
    value: (memberships.data ?? []).filter((m) => m.plan_id === p.id && m.status === "active").length,
  }));

  const revenue = (memberships.data ?? [])
    .filter((m) => m.status === "active")
    .reduce((sum, m) => sum + Number(plans.data?.find((p) => p.id === m.plan_id)?.price ?? 0), 0);

  const present = (attendance.data ?? []).filter((a) => a.status === "present").length;
  const attendanceRate = attendance.data?.length ? Math.round((present / attendance.data.length) * 100) : 0;

  return (
    <AdminPage title="Analytics" description="How the gym is performing across members, classes and revenue">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recurring revenue" value={formatPrice(revenue)} hint="Active memberships" />
        <StatCard label="Total members" value={profiles.data?.length ?? 0} />
        <StatCard label="Total bookings" value={bookings.data?.length ?? 0} />
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} hint={`${present} check-ins`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Member signups</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="currentColor" className="text-xs text-muted-foreground" />
                <YAxis allowDecimals={false} stroke="currentColor" className="text-xs text-muted-foreground" />
                <Tooltip />
                <Line type="monotone" dataKey="members" stroke={COLORS[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Bookings over time</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="currentColor" className="text-xs text-muted-foreground" />
                <YAxis allowDecimals={false} stroke="currentColor" className="text-xs text-muted-foreground" />
                <Tooltip />
                <Bar dataKey="bookings" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Most popular classes</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" allowDecimals={false} stroke="currentColor" className="text-xs" />
                <YAxis type="category" dataKey="name" width={110} stroke="currentColor" className="text-xs" />
                <Tooltip />
                <Bar dataKey="bookings" fill={COLORS[2]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Plan distribution</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {planSplit.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
