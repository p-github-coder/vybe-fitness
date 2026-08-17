import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Gauge, Target, Users } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { classesQuery } from "@/lib/site-data";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Strength, HIIT, Yoga & Cardio | VYBE Fitness" },
      {
        name: "description",
        content:
          "Explore the VYBE Fitness class timetable: strength training, HIIT, vinyasa yoga, cardio engine, functional training and core stability.",
      },
      { property: "og:title", content: "VYBE Fitness Classes" },
      { property: "og:description", content: "Strength, HIIT, yoga, cardio, functional and core classes every week." },
    ],
  }),
  component: Classes,
});

function Classes() {
  const { data, isLoading } = useQuery(classesQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Timetable"
        title="Classes with actual programming"
        subtitle="Coach-led sessions built in blocks so each week compounds on the last. Class booking arrives in the next release."
        image="/images/class-hiit.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((item, index) => (
              <Reveal
                key={item.id}
                delay={index * 70}
                className="surface-card group overflow-hidden hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={item.image ?? "/images/class-strength.jpg"}
                    alt={`${item.name} class at VYBE Fitness`}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-primary" /> {item.trainer}
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-primary" /> {item.schedule}
                    </li>
                    <li className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 shrink-0 text-primary" /> {item.difficulty} · {item.age_group}
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 shrink-0 text-primary" /> {item.target_body_area}
                    </li>
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
