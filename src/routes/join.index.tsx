import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dumbbell, Users } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/join/")({
  head: () => ({
    meta: [
      { title: "Join VYBE Fitness — Become a Member or Apply as a Trainer" },
      {
        name: "description",
        content:
          "Create your VYBE Fitness account. Join as a gym member or apply to coach with us as a certified trainer.",
      },
      { property: "og:title", content: "Join VYBE Fitness" },
      { property: "og:description", content: "Register as a member or apply as a trainer at VYBE Fitness." },
    ],
  }),
  component: JoinChoice,
});

const options = [
  {
    to: "/join/member",
    icon: Dumbbell,
    title: "Join as Member",
    body: "Create your member account, get your induction booked and start training on the floor.",
    points: ["Full gym access on approval", "Class timetable", "Coach-led induction"],
  },
  {
    to: "/join/trainer",
    icon: Users,
    title: "Join as Trainer",
    body: "Apply to coach at VYBE. Share your experience, certifications and specialties for review.",
    points: ["Application reviewed by our team", "Upload your profile photo", "Featured on the trainers page"],
  },
] as const;

function JoinChoice() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Join VYBE"
        title="How do you want to join?"
        subtitle="Pick the path that fits. Both accounts are reviewed by our team before access is granted."
        image="/images/class-strength.jpg"
      />

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
        {options.map((option, index) => (
          <Reveal key={option.to} delay={index * 100}>
            <Link
              to={option.to}
              className="surface-card group flex h-full flex-col p-8 hover:-translate-y-1 hover:border-primary/60"
            >
              <option.icon className="h-8 w-8 text-primary" />
              <h2 className="text-display mt-6 text-3xl">{option.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{option.body}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                {option.points.map((point) => (
                  <li key={point}>· {point}</li>
                ))}
              </ul>
              <span className="mt-8 inline-flex items-center text-sm font-semibold text-primary">
                Continue
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </section>
    </SiteLayout>
  );
}
