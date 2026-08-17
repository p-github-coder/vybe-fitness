import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Reveal } from "@/components/site/Reveal";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact VYBE Fitness — Visit, Call or Book a Tour" },
      {
        name: "description",
        content:
          "Get in touch with VYBE Fitness in Victoria Island, Lagos. Opening hours, location, phone and a contact form for tours and membership questions.",
      },
      { property: "og:title", content: "Contact VYBE Fitness" },
      { property: "og:description", content: "Location, opening hours and contact form for VYBE Fitness Lagos." },
    ],
  }),
  component: Contact,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a valid phone number"),
  message: z.string().trim().min(10, "Tell us a little more").max(1000, "Message is too long"),
});

const hours = [
  ["Monday – Friday", "5:00 AM – 11:00 PM"],
  ["Saturday", "6:00 AM – 9:00 PM"],
  ["Sunday", "7:00 AM – 7:00 PM"],
];

function Contact() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("We couldn't send your message. Please try again in a moment.");
      return;
    }
    toast.success("Message sent — we'll get back to you within one business day.");
    setValues({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Come see the floor"
        subtitle="Book a tour, ask about membership or just tell us what you're training for."
        image="/images/facility.jpg"
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <Reveal className="surface-card p-6 sm:p-8">
          <h2 className="text-display text-2xl">Send a message</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <Field label="Name" id="name" error={errors["name"]}>
              <Input
                id="name"
                value={values.name}
                maxLength={100}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email" id="email" error={errors["email"]}>
              <Input
                id="email"
                type="email"
                value={values.email}
                maxLength={255}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Phone (optional)" id="phone" error={errors["phone"]}>
              <Input
                id="phone"
                value={values.phone}
                maxLength={30}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                placeholder="+234 801 234 5678"
              />
            </Field>
            <Field label="Message" id="message" error={errors["message"]}>
              <Textarea
                id="message"
                rows={5}
                value={values.message}
                maxLength={1000}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                placeholder="What would you like to know?"
              />
            </Field>
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Reveal>

        <Reveal delay={100} className="space-y-6">
          <div className="surface-card space-y-5 p-6 sm:p-8">
            <h2 className="text-display text-2xl">Visit us</h2>
            <InfoRow icon={MapPin} title="Location">
              12 Adeola Odeku Street, Victoria Island, Lagos
            </InfoRow>
            <InfoRow icon={Phone} title="Phone">
              +234 801 234 5678
            </InfoRow>
            <InfoRow icon={Mail} title="Email">
              hello@vybefitness.com
            </InfoRow>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-display text-2xl">Opening hours</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {hours.map(([day, time]) => (
                <li key={day} className="flex justify-between gap-4 border-b border-border/60 pb-3">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium">{time}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{title}</p>
        <p className="mt-1 text-sm">{children}</p>
      </div>
    </div>
  );
}
