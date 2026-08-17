import { createFileRoute } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VYBE Fitness — Our Story, Facilities & Philosophy" },
      {
        name: "description",
        content:
          "How VYBE Fitness was built, what we believe about training, and the facilities and equipment waiting for you in Victoria Island, Lagos.",
      },
      { property: "og:title", content: "About VYBE Fitness" },
      {
        property: "og:description",
        content: "Our story, mission, facilities, training philosophy and equipment.",
      },
    ],
  }),
  component: About,
});

const facilities = [
  { name: "Strength hall", body: "Ten competition racks, calibrated plates and platforms for pulling heavy." },
  { name: "Conditioning floor", body: "Sleds, turf, assault bikes and rowers for engine work." },
  { name: "Studio", body: "Acoustic-treated studio for yoga, mobility and small-group classes." },
  { name: "Recovery zone", body: "Sauna, cold plunge, compression boots and a dedicated stretch area." },
];

const equipment = [
  "Dumbbells to 60kg",
  "Olympic barbells & bumper plates",
  "Cable crossover machines",
  "Squat racks & platforms",
  "Leg press & hack squat",
  "Treadmills, bikes & rowers",
];

function About() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About VYBE"
        title="Built for people who keep showing up"
        subtitle="VYBE Fitness started with a simple frustration: Lagos had plenty of gyms, but very few serious training environments that also felt good to be in."
        image="/images/about-story.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-eyebrow">Our story</p>
            <h2 className="text-display mt-4 text-3xl sm:text-4xl">From one rack to a full floor</h2>
            <p className="mt-6 text-muted-foreground">
              We opened in 2019 with four racks, two coaches and a stubborn belief that good coaching
              beats good marketing. Members brought friends. Friends brought family. Today VYBE is a
              12,000 sq ft training floor with a coaching team of eighteen.
            </p>
            <p className="mt-4 text-muted-foreground">
              What hasn't changed: everyone gets an induction, everyone gets a plan, and nobody gets
              left standing in the middle of the floor wondering what to do next.
            </p>
          </Reveal>
          <Reveal delay={100} className="overflow-hidden rounded-2xl">
            <img
              src="/images/about-story.jpg"
              alt="VYBE Fitness reception and lounge"
              loading="lazy"
              width={1400}
              height={933}
              className="h-full w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="text-eyebrow">Mission</p>
              <h2 className="text-display mt-4 text-3xl sm:text-4xl">
                Make serious training feel welcoming
              </h2>
              <p className="mt-6 text-muted-foreground">
                Our mission is to give every member the coaching, environment and structure to train
                for decades — not for a six-week burst that ends in injury or boredom.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-eyebrow">Training philosophy</p>
              <ul className="mt-6 space-y-5">
                {[
                  ["Technique before load", "You earn weight by owning the movement first."],
                  ["Programmes, not workouts", "Progress needs a plan that spans months, not sessions."],
                  ["Recovery is training", "Sleep, mobility and deloads are part of the programme."],
                  ["Measure something", "Numbers keep you honest when motivation dips."],
                ].map(([title, body]) => (
                  <li key={title} className="border-l-2 border-primary pl-5">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-eyebrow">Facilities</p>
        <h2 className="text-display mt-4 text-3xl sm:text-4xl">Four spaces, one standard</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((facility, index) => (
            <Reveal key={facility.name} delay={index * 80} className="surface-card p-6 hover:-translate-y-1">
              <h3 className="font-semibold">{facility.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{facility.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl">
            <img
              src="/images/equipment.jpg"
              alt="Dumbbell rack in the VYBE strength hall"
              loading="lazy"
              width={1200}
              height={900}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </Reveal>
          <Reveal delay={100} className="overflow-hidden rounded-2xl">
            <img
              src="/images/equipment-2.jpg"
              alt="Squat racks and cable machines"
              loading="lazy"
              width={1200}
              height={900}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-10">
          <p className="text-eyebrow">Equipment</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {equipment.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
