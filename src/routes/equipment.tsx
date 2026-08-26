import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fitnessEquipmentQuery } from "@/lib/fitness";

export const Route = createFileRoute("/equipment")({
  head: () => ({
    meta: [
      { title: "Equipment Library — VYBE Fitness" },
      {
        name: "description",
        content:
          "Explore the VYBE Fitness equipment floor: free weights, cable machines, cardio and functional kit with the muscles and goals each one serves.",
      },
      { property: "og:title", content: "Equipment Library — VYBE Fitness" },
      {
        property: "og:description",
        content: "Every machine and free-weight station on the VYBE floor, with target muscles and benefits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipmentLibrary,
});

function EquipmentLibrary() {
  const { data } = useQuery(fitnessEquipmentQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const items = useMemo(() => (data ?? []).filter((e) => e.published), [data]);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))],
    [items],
  );

  const filtered = items.filter((i) => {
    const matchesCat = category === "All" || i.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      i.name.toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q) ||
      i.target_muscles.some((m) => m.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Training floor"
        title="Equipment Library"
        subtitle="Know exactly what every station does before you touch it — target muscles, benefits and who it suits best."
        image="/images/equipment.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment or muscle group"
            className="max-w-xs"
            aria-label="Search equipment"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "secondary"}
                onClick={() => setCategory(c)}
              >
                {c}
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
                <div className="flex flex-wrap gap-1.5">
                  {item.target_muscles.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
                {item.benefits?.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {item.benefits.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No equipment matches that search yet.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
