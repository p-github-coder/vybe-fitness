import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "waitlist";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type MembershipStatus = "active" | "expired" | "cancelled" | "pending";

export interface AdminProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  profile_image: string | null;
  account_status: "pending" | "approved" | "rejected" | "suspended";
  created_at: string;
}

export function fullName(p: Pick<AdminProfile, "first_name" | "last_name" | "username" | "email"> | null) {
  if (!p) return "Unknown";
  return (
    [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || p.email || "Unknown"
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ---------------- generic list query ---------------- */

export function listQuery<T>(
  table: string,
  opts: { select?: string; orderBy?: string; ascending?: boolean } = {},
) {
  return queryOptions({
    queryKey: ["table", table, opts.select ?? "*", opts.orderBy ?? "created_at"],
    queryFn: async (): Promise<T[]> => {
      const query = supabase
        .from(table as never)
        .select(opts.select ?? "*")
        .order(opts.orderBy ?? "created_at", { ascending: opts.ascending ?? false });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export const profilesQuery = listQuery<AdminProfile>("profiles");
export const rolesQuery = listQuery<{ user_id: string; role: string }>("user_roles", {
  select: "user_id, role",
});

export interface AdminClass {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  trainer: string | null;
  trainer_id: string | null;
  schedule: string | null;
  category: string | null;
  difficulty: string | null;
  age_group: string | null;
  target_body_area: string | null;
  duration_minutes: number;
  capacity: number;
  published: boolean;
  created_at: string;
}

export interface AdminBooking {
  id: string;
  member_id: string;
  class_id: string;
  trainer_id: string | null;
  booking_date: string;
  booking_time: string | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  class_id: string | null;
  trainer_id: string | null;
  attended_on: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: MembershipStatus;
  started_on: string;
  expires_on: string | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  trainer_id: string;
  member_id: string;
  title: string;
  focus: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutPlanItem {
  id: string;
  plan_id: string;
  exercise_name: string;
  sets: number;
  reps: string | null;
  duration: string | null;
  equipment: string | null;
  instructions: string | null;
  sort_order: number;
}

export const adminClassesQuery = listQuery<AdminClass>("classes", { orderBy: "name", ascending: true });
export const bookingsQuery = listQuery<AdminBooking>("bookings", { orderBy: "booking_date" });
export const attendanceQuery = listQuery<AttendanceRecord>("attendance", { orderBy: "attended_on" });
export const userMembershipsQuery = listQuery<UserMembership>("user_memberships");
export const allPlansQuery = listQuery<{
  id: string;
  name: string;
  price: number;
  period: string;
  tagline: string | null;
  features: string[];
  benefits: string[];
  recommended: boolean;
  published: boolean;
  sort_order: number;
  duration_days: number;
  access_level: string;
}>("membership_plans", { orderBy: "sort_order", ascending: true });
export const allTrainersQuery = listQuery<{
  id: string;
  user_id: string | null;
  display_name: string | null;
  years_of_experience: number;
  certifications: string[];
  specialties: string[];
  areas_of_expertise: string[];
  profile_image: string | null;
  bio: string | null;
  is_demo: boolean;
  created_at: string;
}>("trainer_profiles", { orderBy: "display_name", ascending: true });
export const equipmentQuery = listQuery<{
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  target_muscles: string[];
  difficulty: string | null;
  published: boolean;
}>("equipment", { orderBy: "name", ascending: true });
export const exercisesQuery = listQuery<{
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  instructions: string | null;
  target_muscles: string[];
  difficulty: string | null;
  published: boolean;
}>("exercises", { orderBy: "name", ascending: true });
export const announcementsQuery = listQuery<{
  id: string;
  title: string;
  body: string | null;
  published: boolean;
  created_at: string;
}>("announcements");
export const faqsQuery = listQuery<{
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}>("faqs", { orderBy: "sort_order", ascending: true });
export const siteContentQuery = listQuery<{
  id: string;
  key: string;
  label: string | null;
  value: string | null;
}>("site_content", { orderBy: "key", ascending: true });
export const assignmentsQuery = listQuery<{
  id: string;
  trainer_id: string;
  member_id: string;
}>("trainer_assignments");
export const workoutPlansQuery = listQuery<WorkoutPlan>("workout_plans");

/* ---------------- mutations ---------------- */

export async function upsertRow(table: string, values: Record<string, unknown>, id?: string) {
  if (id) {
    const { error } = await supabase
      .from(table as never)
      .update(values as never)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table as never).insert(values as never);
    if (error) throw error;
  }
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase
    .from(table as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type ListQuery<T> = ReturnType<typeof listQuery<T>>;
