import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, plansQuery } from "@/lib/site-data";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Plans & Pricing — VYBE Fitness Lagos" },
      {
        name: "description",
        content:
          "Compare VYBE Fitness membership plans: Essential, Performance and Elite. Unlimited classes, personal training, recovery zone and 24/7 access.",
      },
      { property: "og:title", content: "VYBE Fitness Membership Plans" },
      { property: "og:description", content: "Essential, Performance and Elite memberships compared." },
    ],
  }),
  component: Membership,
});

const comparison = [
  { label: "Full gym floor access", tiers: [true, true, true] },
  { label: "Locker room & showers", tiers: [true, true, true] },
  { label: "Unlimited group classes", tiers: [false, true, true] },
  { label: "Personal training sessions", tiers: [false, true, true] },
  { label: "Sauna & recovery zone", tiers: [false, true, true] },
  { label: "24/7 access", tiers: [false, true, true] },
  { label: "Weekly 1:1 coaching", tiers: [false, false, true] },
  { label: "Nutrition plan", tiers: [false, false, true] },
  { label: "Guest passes", tiers: [false, false, true] },
];

function Membership() {
  const { data, isLoading } = useQuery(plansQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Membership"
        title="Plans that match how you train"
        subtitle="No joining fee, no lock-in contract. Move between plans whenever your training changes."
        image="/images/equipment-2.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {(data ?? []).map((plan, index) => (
              <Reveal
                key={plan.id}
                delay={index * 90}
                className={`surface-card p-8 hover:-translate-y-1 ${
                  plan.recommended ? "border-primary/60 shadow-[var(--shadow-glow)] lg:scale-[1.02]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-display text-2xl">{plan.name}</h2>
                  {plan.recommended && <Badge>Recommended</Badge>}
                </div>
                <p className="mt-5 text-4xl font-semibold">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

                <ul className="mt-7 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.benefits.length > 0 && (
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Benefits</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit}>· {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button asChild className="mt-8 w-full" variant={plan.recommended ? "default" : "secondary"}>
                  <Link to="/join">Join {plan.name}</Link>
                </Button>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h2 className="text-display text-3xl sm:text-4xl">Benefits compared</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 text-left font-medium text-muted-foreground">Benefit</th>
                  {["Essential", "Performance", "Elite"].map((tier) => (
                    <th key={tier} className="px-3 py-4 text-center font-semibold">
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-b border-border/60">
                    <td className="py-4 pr-4 text-muted-foreground">{row.label}</td>
                    {row.tiers.map((included, i) => (
                      <td key={i} className="px-3 py-4 text-center">
                        {included ? (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/join">Join Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
