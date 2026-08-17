import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trainersQuery } from "@/lib/site-data";

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "Trainers — Certified Coaches at VYBE Fitness Lagos" },
      {
        name: "description",
        content:
          "Meet the certified VYBE Fitness coaching team: strength, HIIT, yoga, conditioning and athletic performance specialists in Victoria Island, Lagos.",
      },
      { property: "og:title", content: "VYBE Fitness Trainers" },
      { property: "og:description", content: "Certified strength, conditioning, yoga and performance coaches." },
    ],
  }),
  component: Trainers,
});

function Trainers() {
  const { data, isLoading } = useQuery(trainersQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Coaching team"
        title="The people in your corner"
        subtitle="Every VYBE coach is certified, insured and continuously assessed. Find the one whose specialty matches your goal."
        image="/images/class-functional.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[520px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((trainer, index) => (
              <Reveal
                key={trainer.id}
                delay={index * 80}
                className="surface-card group overflow-hidden hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="aspect-4/5 overflow-hidden">
                  <img
                    src={trainer.profile_image ?? "/images/trainer-marcus.jpg"}
                    alt={trainer.display_name ?? "VYBE trainer"}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{trainer.display_name}</h2>
                    <p className="mt-1 text-sm text-primary">
                      {trainer.years_of_experience} years experience
                    </p>
                  </div>
                  {trainer.bio && <p className="text-sm text-muted-foreground">{trainer.bio}</p>}
                  <TrainerMeta label="Certifications" values={trainer.certifications} />
                  <TrainerMeta label="Specialties" values={trainer.specialties} />
                  <TrainerMeta label="Body areas trained" values={trainer.areas_of_expertise} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function TrainerMeta({ label, values }: { label: string; values: string[] }) {
  const clean = values.filter(Boolean);
  if (clean.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {clean.map((value) => (
          <Badge key={value} variant="secondary" className="font-normal">
            {value.trim()}
          </Badge>
        ))}
      </div>
    </div>
  );
}
