import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { collectErrors, friendlySignupError, isUsernameTaken, memberSignupSchema } from "@/lib/signup";

export const Route = createFileRoute("/join/member")({
  head: () => ({
    meta: [
      { title: "Member Registration — VYBE Fitness" },
      { name: "description", content: "Create your VYBE Fitness member account and start training with us in Lagos." },
      { property: "og:title", content: "Member Registration — VYBE Fitness" },
      { property: "og:description", content: "Create your VYBE Fitness member account." },
    ],
  }),
  component: MemberSignup,
});

const empty = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  password: "",
  confirm_password: "",
};

function MemberSignup() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function set(key: keyof typeof empty, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = memberSignupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    if (await isUsernameTaken(parsed.data.username)) {
      setErrors({ username: "That username is already taken." });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          requested_role: "member",
          first_name: parsed.data.first_name,
          last_name: parsed.data.last_name,
          username: parsed.data.username,
          phone: parsed.data.phone,
          age: String(parsed.data.age),
          gender: parsed.data.gender ?? "",
        },
      },
    });
    setSubmitting(false);

    if (error) {
      toast.error(friendlySignupError(error.message));
      return;
    }

    await queryClient.invalidateQueries();
    navigate({ to: "/status", replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Member registration"
        title="Create your member account"
        subtitle="Your account is reviewed by our team before member access is switched on."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <form className="surface-card space-y-6 p-6 sm:p-9" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="First name" id="member_first_name" error={errors["first_name"]}>
              <Input id="member_first_name" name="member_first_name" autoComplete="given-name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} />
            </FormField>
            <FormField label="Last name" id="member_last_name" error={errors["last_name"]}>
              <Input id="member_last_name" name="member_last_name" autoComplete="family-name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} />
            </FormField>
            <FormField label="Username" id="member_username" error={errors["username"]}>
              <Input id="member_username" name="member_username" autoComplete="off" value={values.username} onChange={(e) => set("username", e.target.value)} />
            </FormField>
            <FormField label="Email" id="member_email" error={errors["email"]}>
              <Input id="member_email" name="member_email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
            </FormField>
            <FormField label="Phone" id="member_phone" error={errors["phone"]}>
              <Input id="member_phone" name="member_phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label="Age" id="member_age" error={errors["age"]}>
              <Input id="member_age" name="member_age" inputMode="numeric" autoComplete="off" value={values.age} onChange={(e) => set("age", e.target.value)} />
            </FormField>
            <FormField label="Gender (optional)" id="member_gender" error={errors["gender"]}>
              <Input id="member_gender" name="member_gender" autoComplete="off" value={values.gender} onChange={(e) => set("gender", e.target.value)} />
            </FormField>
            <div className="hidden sm:block" />
            <FormField label="Password" id="member_password" error={errors["password"]}>
              <Input
                id="member_password"
                name="member_password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </FormField>
            <FormField label="Confirm password" id="member_confirm_password" error={errors["confirm_password"]}>
              <Input
                id="member_confirm_password"
                name="member_confirm_password"
                type="password"
                autoComplete="new-password"
                value={values.confirm_password}
                onChange={(e) => set("confirm_password", e.target.value)}
              />
            </FormField>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create member account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}

export function FormField({
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
