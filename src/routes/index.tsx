import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dumbbell, HeartPulse, Sparkles, Timer, Users } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classesQuery, formatPrice, plansQuery, trainersQuery } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VYBE Fitness — Premium Gym in Lagos | Your fitness. Your VYBE." },
      {
        name: "description",
        content:
          "VYBE Fitness is a premium training floor in Victoria Island, Lagos. Elite coaches, world-class equipment and classes built around real progress.",
      },
      { property: "og:title", content: "VYBE Fitness — Your fitness. Your VYBE." },
      {
        property: "og:description",
        content: "Premium gym, elite coaching and classes built around real progress in Lagos.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  { icon: Dumbbell, title: "Elite equipment", body: "Racks, plates and machines maintained to competition standard." },
  { icon: Users, title: "Coach-led floor", body: "Certified coaches on the floor every session, not just in packages." },
  { icon: HeartPulse, title: "Recovery built in", body: "Sauna, mobility zone and recovery programming for real longevity." },
  { icon: Timer, title: "24/7 access", body: "Train at 5am or midnight — the floor is yours on Performance and Elite." },
];

const testimonials = [
  {
    quote: "Six months in and I've deadlifted double what I could before. The coaching is the difference.",
    name: "Chidera N.",
    role: "Member since 2024",
  },
  {
    quote: "It doesn't feel like a gym chain. It feels like a serious training space that happens to be beautiful.",
    name: "Ifeoma A.",
    role: "Performance member",
  },
  {
    quote: "The classes are hard, well-programmed and never boring. HIIT nights are the highlight of my week.",
    name: "Segun O.",
    role: "Elite member",
  },
];

function Home() {
  const trainers = useQuery(trainersQuery);
  const classes = useQuery(classesQuery);
  const plans = useQuery(plansQuery);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <img
          src="/images/hero-gym.jpg"
          alt="Athletes training with barbells in the VYBE Fitness gym floor"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-veil)" }} />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pt-32 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <Reveal>
            <p className="text-eyebrow">Victoria Island · Lagos</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-display mt-5 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
              Train like it <span className="gradient-text">actually</span> matters
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              VYBE Fitness is a premium coaching floor for people chasing real strength, real
              conditioning and real change. Your fitness. Your VYBE.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link to="/join">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/membership">View Membership Plans</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <p className="text-eyebrow">The gym</p>
            <h2 className="text-display mt-4 text-3xl sm:text-5xl">
              Twelve thousand square feet of intent
            </h2>
            <p className="mt-6 text-muted-foreground">
              We built VYBE for the people who show up. Every rack, every machine and every class is
              chosen to move you forward — with coaches who know your name, your numbers and what
              you're working toward.
            </p>
            <p className="mt-4 text-muted-foreground">
              No queues for the squat rack. No guesswork. No shame. Just a serious, beautiful place
              to do hard things consistently.
            </p>
          </Reveal>
          <Reveal delay={120} className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="surface-card p-6 hover:-translate-y-1 hover:border-primary/40">
                <pillar.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-base font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="relative overflow-hidden border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal className="overflow-hidden rounded-2xl">
            <img
              src="/images/class-strength.jpg"
              alt="Member performing a heavy barbell lift"
              loading="lazy"
              width={1024}
              height={768}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="text-eyebrow">Transformation</p>
            <h2 className="text-display mt-4 text-3xl sm:text-5xl">
              Progress is not a mood. It's a plan.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Motivation runs out around week three. Structure doesn't. Our coaches build the plan,
              track the numbers and adjust as your body adapts — so the work you put in actually
              compounds.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-6">
              {[
                ["1,200+", "Active members"],
                ["18", "Certified coaches"],
                ["40+", "Weekly classes"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-display text-2xl text-primary sm:text-3xl">{value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground uppercase">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow">Coaching</p>
            <h2 className="text-display mt-4 text-3xl sm:text-5xl">Featured trainers</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/trainers">
              All trainers <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(trainers.data ?? []).slice(0, 3).map((trainer, index) => (
            <Reveal key={trainer.id} delay={index * 90} className="surface-card group overflow-hidden hover:-translate-y-1">
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
              <div className="p-6">
                <h3 className="text-lg font-semibold">{trainer.display_name}</h3>
                <p className="mt-1 text-sm text-primary">{trainer.years_of_experience} years experience</p>
                <p className="mt-3 text-sm text-muted-foreground">{trainer.specialties.join(" · ")}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CLASSES */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-eyebrow">Timetable</p>
              <h2 className="text-display mt-4 text-3xl sm:text-5xl">Popular classes</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/classes">
                Full schedule <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(classes.data ?? []).slice(0, 4).map((item, index) => (
              <Reveal key={item.id} delay={index * 80} className="surface-card group overflow-hidden hover:-translate-y-1">
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={item.image ?? "/images/class-strength.jpg"}
                    alt={item.name}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-3 text-xs tracking-wider text-primary uppercase">{item.schedule}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="text-eyebrow">Membership</p>
        <h2 className="text-display mt-4 text-3xl sm:text-5xl">Pick your level of commitment</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {(plans.data ?? []).map((plan, index) => (
            <Reveal
              key={plan.id}
              delay={index * 90}
              className={`surface-card p-7 hover:-translate-y-1 ${plan.recommended ? "border-primary/60" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-display text-2xl">{plan.name}</h3>
                {plan.recommended && <Badge>Recommended</Badge>}
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild size="lg" variant="secondary">
            <Link to="/membership">Compare all benefits</Link>
          </Button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-eyebrow">Members</p>
          <h2 className="text-display mt-4 text-3xl sm:text-5xl">What the floor says</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 90} className="surface-card p-7">
                <p className="text-lg leading-relaxed">“{testimonial.quote}”</p>
                <p className="mt-6 text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{testimonial.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI TEASER */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal className="surface-card relative overflow-hidden p-8 sm:p-14">
          <div className="max-w-2xl">
            <Sparkles className="h-7 w-7 text-primary" />
            <p className="text-eyebrow mt-6">Coming soon</p>
            <h2 className="text-display mt-4 text-3xl sm:text-5xl">Your AI fitness assistant</h2>
            <p className="mt-5 text-muted-foreground">
              Soon every VYBE member gets an assistant that knows their programme, answers training
              questions and adapts plans between coaching sessions. In development for the next
              release.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CLOSING CTA */}
      <section className="relative isolate overflow-hidden border-t border-border">
        <img
          src="/images/facility.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-veil)" }} />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="text-display text-4xl sm:text-6xl">Start this week</h2>
          <p className="mt-5 text-muted-foreground">
            Create your account, pick a plan and get your induction booked. Your fitness. Your VYBE.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/join">Join Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Book a tour</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
