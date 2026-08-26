import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { MemberShell } from "@/components/member/MemberShell";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { RoleGate } from "@/components/site/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import { bmi, fitnessProfileQuery, progressQuery } from "@/lib/fitness";
import { formatDate } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/member/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — VYBE Fitness" },
      { name: "description", content: "Track your weight, workouts completed and body metrics over time." },
      { property: "og:title", content: "My Progress — VYBE Fitness" },
      { property: "og:description", content: "Track your weight and workouts at VYBE Fitness." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="member">
      <MemberProgress />
    </RoleGate>
  ),
});

function MemberProgress() {
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(fitnessProfileQuery(userId));
  const { data: entries } = useQuery(progressQuery);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [workouts, setWorkouts] = useState("1");

  const mine = (entries ?? [])
    .filter((e) => e.user_id === userId)
    .sort((a, b) => a.recorded_on.localeCompare(b.recorded_on));

  const chart = mine.map((e) => ({
    date: formatDate(e.recorded_on),
    weight: e.weight_kg ? Number(e.weight_kg) : null,
    workouts: e.workouts_completed,
  }));

  const log = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("progress_entries").insert({
        user_id: userId,
        recorded_on: date,
        weight_kg: weight ? Number(weight) : null,
        workouts_completed: Number(workouts) || 0,
      } as never);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Progress logged");
      setWeight("");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const latest = mine[mine.length - 1];
  const first = mine[0];
  const delta =
    latest?.weight_kg && first?.weight_kg ? Number(latest.weight_kg) - Number(first.weight_kg) : null;

  return (
    <MemberShell>
      <p className="text-eyebrow">Progress</p>
      <h1 className="text-display mt-3 text-4xl">Your results over time</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current weight" value={latest?.weight_kg ? `${latest.weight_kg} kg` : "—"} />
        <StatCard
          label="Change"
          value={delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`}
          hint="Since your first entry"
        />
        <StatCard label="BMI" value={bmi(profile ?? null) ?? "—"} hint="From your fitness profile" />
        <StatCard
          label="Workouts logged"
          value={mine.reduce((sum, e) => sum + (e.workouts_completed ?? 0), 0)}
        />
      </div>

      <div className="surface-card mt-8 p-6">
        <h2 className="font-semibold">Log today</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="p-date">Date</Label>
            <Input id="p-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-weight">Weight (kg)</Label>
            <Input id="p-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="72" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-workouts">Workouts</Label>
            <Input id="p-workouts" type="number" value={workouts} onChange={(e) => setWorkouts(e.target.value)} />
          </div>
          <Button disabled={log.isPending} onClick={() => log.mutate()}>
            {log.isPending ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </div>

      <div className="surface-card mt-8 p-6">
        <h2 className="font-semibold">Weight trend</h2>
        <div className="mt-4 h-72">
          {chart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Log your first entry to see the chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </MemberShell>
  );
}
