import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fitnessExercisesQuery } from "@/lib/fitness";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Exercise Library — VYBE Fitness" },
      {
        name: "description",
        content:
          "Browse the VYBE exercise library: coaching cues, target muscles, recommended sets and reps, and the equipment each movement needs.",
      },
      { property: "og:title", content: "Exercise Library — VYBE Fitness" },
      {
        property: "og:description",
        content: "Coaching cues, target muscles and rep schemes for every movement we program at VYBE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExerciseLibrary,
});

const MUSCLES = ["All", "Full body", "Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Cardio"];

function ExerciseLibrary() {
  const { data } = useQuery(fitnessExercisesQuery);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("All");

  const items = useMemo(() => (data ?? []).filter((e) => e.published), [data]);

  const filtered = items.filter((i) => {
    const matchesMuscle = muscle === "All" || i.target_muscles.some((m) => m.toLowerCase() === muscle.toLowerCase());
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
    return matchesMuscle && matchesSearch;
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Movement library"
        title="Exercise Library"
        subtitle="Every movement we coach, with form cues, rep schemes and the kit you need to run it."
        image="/images/facility.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises"
            className="max-w-xs"
            aria-label="Search exercises"
          />
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Button key={m} size="sm" variant={muscle === m ? "default" : "secondary"} onClick={() => setMuscle(m)}>
                {m}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="surface-card overflow-hidden">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  {item.difficulty && <Badge variant="secondary">{item.difficulty}</Badge>}
                </div>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                {item.instructions && (
                  <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">How to: </span>
                    {item.instructions}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {item.target_muscles.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.recommended_reps ?? "3 × 10"} · {item.equipment_name ?? "Bodyweight"}
                </p>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises match that filter yet.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
