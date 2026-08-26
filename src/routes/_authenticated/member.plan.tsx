import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { MemberShell } from "@/components/member/MemberShell";
import { RoleGate } from "@/components/site/RoleGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/auth";
import { buildWeeklyPlan, fitnessExercisesQuery, fitnessProfileQuery } from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/member/plan")({
  head: () => ({
    meta: [
      { title: "My Weekly Plan — VYBE Fitness" },
      { name: "description", content: "Your personalised VYBE weekly training schedule." },
      { property: "og:title", content: "My Weekly Plan — VYBE Fitness" },
      { property: "og:description", content: "Your personalised VYBE weekly training schedule." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="member">
      <MemberPlan />
    </RoleGate>
  ),
});

function MemberPlan() {
  const { userId } = useAccount();
  const { data: profile } = useQuery(fitnessProfileQuery(userId));
  const { data: exercises } = useQuery(fitnessExercisesQuery);

  const week = buildWeeklyPlan(profile ?? null, exercises ?? []);

  return (
    <MemberShell>
      <p className="text-eyebrow">Weekly plan</p>
      <h1 className="text-display mt-3 text-4xl">Your training week</h1>
      {!profile?.completed && (
        <div className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Complete your fitness assessment for a plan built around your goals.
          </p>
          <Button asChild size="sm">
            <Link to="/member/assessment">Start assessment</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {week.map((day) => (
          <article key={day.day} className="surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{day.day}</h2>
                <p className="text-xs text-muted-foreground">{day.title}</p>
              </div>
              <Badge variant="secondary">{day.goal}</Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {day.exercises.map((ex) => (
                <li key={ex.name} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
                  <div>
                    <p className="font-medium">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.equipment}</p>
                  </div>
                  <span className="whitespace-nowrap text-muted-foreground">
                    {ex.sets} × {ex.reps}
                  </span>
                </li>
              ))}
              {day.exercises.length === 0 && <li className="text-muted-foreground">Rest and mobility.</li>}
            </ul>
          </article>
        ))}
      </div>
    </MemberShell>
  );
}
