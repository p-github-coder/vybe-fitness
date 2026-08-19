import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  UserCheck,
  UserCog,
} from "lucide-react";
import type { ReactNode } from "react";

import { RoleGate } from "@/components/site/RoleGate";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/approvals", label: "Account Approval", icon: UserCheck },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/trainers", label: "Trainers", icon: UserCog },
  { to: "/admin/classes", label: "Classes", icon: CalendarCheck },
  { to: "/admin/bookings", label: "Bookings", icon: ListChecks },
  { to: "/admin/memberships", label: "Memberships", icon: CreditCard },
  { to: "/admin/equipment", label: "Equipment", icon: Dumbbell },
  { to: "/admin/exercises", label: "Exercises", icon: Activity },
  { to: "/admin/ai", label: "AI Management", icon: Sparkles },
  { to: "/admin/content", label: "Website Content", icon: BookOpen },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const trainerNav: NavItem[] = [
  { to: "/trainer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/trainer/members", label: "My Members", icon: Users },
  { to: "/trainer/classes", label: "Classes", icon: CalendarCheck },
  { to: "/trainer/plans", label: "Workout Plans", icon: Dumbbell },
  { to: "/trainer/attendance", label: "Attendance", icon: ListChecks },
  { to: "/trainer/messages", label: "Messages", icon: MessageSquare },
  { to: "/trainer/profile", label: "Profile", icon: UserCog },
];

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <RoleGate role="admin">
      <DashboardShell nav={adminNav} area="Admin console" title={title} description={description} actions={actions}>
        {children}
      </DashboardShell>
    </RoleGate>
  );
}

export function TrainerPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <RoleGate role="trainer">
      <DashboardShell nav={trainerNav} area="Trainer portal" title={title} description={description} actions={actions}>
        {children}
      </DashboardShell>
    </RoleGate>
  );
}

export function head(title: string, description: string) {
  return () => ({
    meta: [
      { title: `${title} — VYBE Fitness` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — VYBE Fitness` },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  });
}
