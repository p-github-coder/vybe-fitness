import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/dashboard/CrudManager";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { MatchBadge, MemberShell } from "@/components/member/MemberShell";
import { RoleGate } from "@/components/site/RoleGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { displayName, useAccount } from "@/lib/auth";
import {
  fitnessEquipmentQuery,
  fitnessExercisesQuery,
  fitnessProfileQuery,
  recommendClasses,
  recommendEquipment,
  recommendExercises,
  recommendTrainers,
} from "@/lib/fitness";
import {
  adminClassesQuery,
  allTrainersQuery,
  allPlansQuery,
  announcementsQuery,
  attendanceQuery,
  bookingsQuery,
  formatDate,
  listQuery,
  upsertRow,
  userMembershipsQuery,
  workoutPlansQuery,
  type WorkoutPlanItem,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/member/")({
  head: () => ({
    meta: [
      { title: "Member Area — VYBE Fitness" },
      { name: "description", content: "Book classes, track attendance and view your workout plans." },
      { property: "og:title", content: "Member Area — VYBE Fitness" },
      { property: "og:description", content: "Book classes, track attendance and view your workout plans." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="member">
      <MemberDashboard />
    </RoleGate>
  ),
});

const planItemsQuery = listQuery<WorkoutPlanItem>("workout_plan_items", {
  orderBy: "sort_order",
  ascending: true,
});

function MemberDashboard() {
  const { profile, userId } = useAccount();
  const queryClient = useQueryClient();

  const classes = useQuery(adminClassesQuery);
  const bookings = useQuery(bookingsQuery);
  const attendance = useQuery(attendanceQuery);
  const memberships = useQuery(userMembershipsQuery);
  const plans = useQuery(allPlansQuery);
  const workouts = useQuery(workoutPlansQuery);
  const workoutItems = useQuery(planItemsQuery);
  const announcements = useQuery(announcementsQuery);
  const trainers = useQuery(allTrainersQuery);
  const equipmentLib = useQuery(fitnessEquipmentQuery);
  const exerciseLib = useQuery(fitnessExercisesQuery);
  const fitness = useQuery(fitnessProfileQuery(userId));

  const fp = fitness.data ?? null;
  const recEquipment = recommendEquipment(fp, equipmentLib.data ?? []).slice(0, 3);
  const recExercises = recommendExercises(fp, exerciseLib.data ?? []).slice(0, 4);
  const recTrainers = recommendTrainers(fp, (trainers.data ?? []) as never).slice(0, 3);
  const recClasses = recommendClasses(fp, (classes.data ?? []) as never).slice(0, 3);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const myBookings = (bookings.data ?? []).filter((b) => b.member_id === userId);
  const myAttendance = (attendance.data ?? []).filter((a) => a.member_id === userId);
  const myMembership = (memberships.data ?? []).find((m) => m.user_id === userId && m.status === "active");
  const myPlanName = plans.data?.find((p) => p.id === myMembership?.plan_id)?.name ?? "No plan assigned";
  const myWorkouts = (workouts.data ?? []).filter((w) => w.member_id === userId);
  const published = (classes.data ?? []).filter((c) => c.published);

  const book = useMutation({
    mutationFn: async (classId: string) => {
      await upsertRow("bookings", {
        member_id: userId,
        class_id: classId,
        booking_date: date,
        status: "confirmed",
      });
    },
    onSuccess: async () => {
      toast.success("Class booked");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Booking cancelled");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <MemberShell>
      <div>
        <p className="text-eyebrow">Member area</p>
        <h1 className="text-display mt-3 text-4xl">Welcome back, {displayName(profile)}</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Membership" value={myPlanName} hint={myMembership ? `Renews ${formatDate(myMembership.expires_on)}` : "Contact the front desk"} />
          <StatCard label="Upcoming bookings" value={myBookings.filter((b) => b.status === "confirmed").length} />
          <StatCard label="Check-ins" value={myAttendance.filter((a) => a.status === "present").length} />
          <StatCard label="Workout plans" value={myWorkouts.length} />
        </div>

        <Tabs defaultValue="foryou" className="mt-10">
          <TabsList>
            <TabsTrigger value="foryou">For you</TabsTrigger>
            <TabsTrigger value="book">Book a class</TabsTrigger>
            <TabsTrigger value="bookings">My bookings</TabsTrigger>
            <TabsTrigger value="plans">Workout plans</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="news">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="foryou" className="mt-6 space-y-8">
            {!fp?.completed && (
              <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <h2 className="font-semibold">Unlock your personalised VYBE plan</h2>
                  <p className="text-sm text-muted-foreground">
                    Take the 2-minute fitness assessment for tailored equipment, coaches, classes and a weekly plan.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to="/member/assessment">Start assessment</Link>
                </Button>
              </div>
            )}

            <RecSection title="Recommended equipment" href="/equipment">
              {recEquipment.map((r) => (
                <RecCard
                  key={r.item.id}
                  title={r.item.name}
                  image={r.item.image}
                  score={r.score}
                  reasons={r.reasons}
                  meta={r.item.target_muscles.slice(0, 3).join(" · ")}
                />
              ))}
            </RecSection>

            <RecSection title="Recommended classes" href="/classes">
              {recClasses.map((r) => (
                <RecCard
                  key={r.item.id}
                  title={r.item.name}
                  image={r.item.image}
                  score={r.score}
                  reasons={r.reasons}
                  meta={`${r.item.schedule ?? "Flexible"} · ${r.item.duration_minutes} min`}
                />
              ))}
            </RecSection>

            <RecSection title="Recommended trainers" href="/trainers">
              {recTrainers.map((r) => (
                <RecCard
                  key={r.item.id}
                  title={r.item.display_name ?? "VYBE coach"}
                  image={r.item.profile_image}
                  score={r.score}
                  reasons={r.reasons}
                  meta={r.item.specialties.slice(0, 3).join(" · ")}
                />
              ))}
            </RecSection>

            <RecSection title="Recommended exercises" href="/exercises">
              {recExercises.map((r) => (
                <RecCard
                  key={r.item.id}
                  title={r.item.name}
                  image={r.item.image}
                  score={r.score}
                  reasons={r.reasons}
                  meta={`${r.item.recommended_reps ?? "3 × 10"} · ${r.item.equipment_name ?? "Bodyweight"}`}
                />
              ))}
            </RecSection>
          </TabsContent>

          <TabsContent value="book" className="mt-6 space-y-5">
            <div className="max-w-xs space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {published.map((c) => {
                const taken = (bookings.data ?? []).filter(
                  (b) => b.class_id === c.id && b.booking_date === date && b.status !== "cancelled",
                ).length;
                const full = taken >= c.capacity;
                return (
                  <div key={c.id} className="surface-card overflow-hidden">
                    {c.image && <img src={c.image} alt="" className="h-32 w-full object-cover" />}
                    <div className="space-y-2 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-semibold">{c.name}</h2>
                        <Badge variant="secondary">{c.capacity - taken} left</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.schedule ?? "Flexible"} · {c.duration_minutes} min · {c.trainer ?? "VYBE coach"}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        disabled={full || book.isPending}
                        onClick={() => book.mutate(c.id)}
                      >
                        {full ? "Class full" : "Book class"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBookings.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-muted-foreground">No bookings yet.</TableCell></TableRow>
                  )}
                  {myBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{classes.data?.find((c) => c.id === b.class_id)?.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(b.booking_date)}</TableCell>
                      <TableCell><StatusBadge value={b.status} /></TableCell>
                      <TableCell className="text-right">
                        {b.status === "confirmed" && (
                          <Button size="sm" variant="ghost" onClick={() => cancel.mutate(b.id)}>Cancel</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="mt-6 grid gap-4 lg:grid-cols-2">
            {myWorkouts.length === 0 && <p className="text-sm text-muted-foreground">Your trainer hasn't assigned a plan yet.</p>}
            {myWorkouts.map((w) => (
              <div key={w.id} className="surface-card p-5">
                <h2 className="font-semibold">{w.title}</h2>
                {w.focus && <p className="text-xs text-muted-foreground">Focus: {w.focus}</p>}
                <ul className="mt-4 space-y-1 text-sm">
                  {(workoutItems.data ?? []).filter((i) => i.plan_id === w.id).map((i) => (
                    <li key={i.id} className="flex justify-between border-b border-border/60 py-1">
                      <span>{i.exercise_name}</span>
                      <span className="text-muted-foreground">{i.sets} × {i.reps ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-muted-foreground">No check-ins recorded.</TableCell></TableRow>
                  )}
                  {myAttendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-muted-foreground">{formatDate(a.attended_on)}</TableCell>
                      <TableCell>{classes.data?.find((c) => c.id === a.class_id)?.name ?? "—"}</TableCell>
                      <TableCell><StatusBadge value={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6 space-y-4">
            {(announcements.data ?? []).filter((a) => a.published).map((a) => (
              <article key={a.id} className="surface-card p-5">
                <h2 className="font-semibold">{a.title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MemberShell>
  );
}

function RecSection({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to={href}>View all</Link>
        </Button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function RecCard({
  title,
  image,
  score,
  reasons,
  meta,
}: {
  title: string;
  image: string | null;
  score: number;
  reasons: string[];
  meta?: string;
}) {
  return (
    <article className="surface-card overflow-hidden">
      {image && <img src={image} alt="" loading="lazy" className="h-32 w-full object-cover" />}
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{title}</h3>
          <MatchBadge score={score} />
        </div>
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        <ul className="space-y-1 text-xs text-muted-foreground">
          {reasons.slice(0, 2).map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
