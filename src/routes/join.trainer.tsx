import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/routes/join.member";
import {
  collectErrors,
  friendlySignupError,
  isUsernameTaken,
  trainerSignupSchema,
  uploadTrainerImage,
  validateImage,
} from "@/lib/signup";

export const Route = createFileRoute("/join/trainer")({
  head: () => ({
    meta: [
      { title: "Trainer Application — Coach at VYBE Fitness" },
      {
        name: "description",
        content:
          "Apply to coach at VYBE Fitness. Share your experience, certifications, specialties and profile photo for review.",
      },
      { property: "og:title", content: "Trainer Application — VYBE Fitness" },
      { property: "og:description", content: "Apply to coach at VYBE Fitness in Lagos." },
    ],
  }),
  component: TrainerSignup,
});

const empty = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  age: "",
  password: "",
  confirm_password: "",
  years_of_experience: "",
  certifications: "",
  specialties: "",
  areas_of_expertise: "",
};

function TrainerSignup() {
  const [values, setValues] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function set(key: keyof typeof empty, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = trainerSignupSchema.safeParse(values);
    const fieldErrors = parsed.success ? {} : collectErrors(parsed.error);

    if (file) {
      const imageError = validateImage(file);
      if (imageError) fieldErrors["profile_image"] = imageError;
    }
    if (Object.keys(fieldErrors).length > 0 || !parsed.success) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    if (await isUsernameTaken(parsed.data.username)) {
      setErrors({ username: "That username is already taken." });
      setSubmitting(false);
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          requested_role: "trainer",
          first_name: parsed.data.first_name,
          last_name: parsed.data.last_name,
          username: parsed.data.username,
          phone: parsed.data.phone,
          age: String(parsed.data.age),
          years_of_experience: String(parsed.data.years_of_experience),
          certifications: parsed.data.certifications,
          specialties: parsed.data.specialties,
          areas_of_expertise: parsed.data.areas_of_expertise,
        },
      },
    });

    if (error) {
      setSubmitting(false);
      toast.error(friendlySignupError(error.message));
      return;
    }

    const userId = signUpData.user?.id;
    if (file && userId) {
      const url = await uploadTrainerImage(userId, file);
      if (url) {
        await supabase.from("trainer_profiles").update({ profile_image: url }).eq("user_id", userId);
        await supabase.from("profiles").update({ profile_image: url }).eq("user_id", userId);
      } else {
        toast.warning("Your application was submitted, but the profile photo failed to upload.");
      }
    }

    setSubmitting(false);
    await queryClient.invalidateQueries();
    navigate({ to: "/status", replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Trainer application"
        title="Apply to coach at VYBE"
        subtitle="Tell us about your experience. Our team reviews every application before your profile goes live."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <form className="surface-card space-y-8 p-6 sm:p-9" onSubmit={handleSubmit} noValidate>
          <div>
            <h2 className="text-eyebrow">Your details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField label="First name" id="trainer_first_name" error={errors["first_name"]}>
                <Input id="trainer_first_name" name="trainer_first_name" autoComplete="given-name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} />
              </FormField>
              <FormField label="Last name" id="trainer_last_name" error={errors["last_name"]}>
                <Input id="trainer_last_name" name="trainer_last_name" autoComplete="family-name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} />
              </FormField>
              <FormField label="Username" id="trainer_username" error={errors["username"]}>
                <Input id="trainer_username" name="trainer_username" autoComplete="off" value={values.username} onChange={(e) => set("username", e.target.value)} />
              </FormField>
              <FormField label="Email" id="trainer_email" error={errors["email"]}>
                <Input id="trainer_email" name="trainer_email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
              </FormField>
              <FormField label="Phone" id="trainer_phone" error={errors["phone"]}>
                <Input id="trainer_phone" name="trainer_phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
              </FormField>
              <FormField label="Age" id="trainer_age" error={errors["age"]}>
                <Input id="trainer_age" name="trainer_age" inputMode="numeric" autoComplete="off" value={values.age} onChange={(e) => set("age", e.target.value)} />
              </FormField>
              <FormField label="Password" id="trainer_password" error={errors["password"]}>
                <Input
                  id="trainer_password"
                  name="trainer_password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </FormField>
              <FormField label="Confirm password" id="trainer_confirm_password" error={errors["confirm_password"]}>
                <Input
                  id="trainer_confirm_password"
                  name="trainer_confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirm_password}
                  onChange={(e) => set("confirm_password", e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div>
            <h2 className="text-eyebrow">Coaching profile</h2>
            <div className="mt-5 space-y-5">
              <FormField label="Years of experience" id="years_of_experience" error={errors["years_of_experience"]}>
                <Input
                  id="years_of_experience"
                  inputMode="numeric"
                  value={values.years_of_experience}
                  onChange={(e) => set("years_of_experience", e.target.value)}
                />
              </FormField>
              <FormField label="Certifications (comma separated)" id="certifications" error={errors["certifications"]}>
                <Textarea
                  id="certifications"
                  rows={2}
                  placeholder="NASM-CPT, Precision Nutrition L1"
                  value={values.certifications}
                  onChange={(e) => set("certifications", e.target.value)}
                />
              </FormField>
              <FormField label="Specialties (comma separated)" id="specialties" error={errors["specialties"]}>
                <Textarea
                  id="specialties"
                  rows={2}
                  placeholder="Strength, Fat loss, Mobility"
                  value={values.specialties}
                  onChange={(e) => set("specialties", e.target.value)}
                />
              </FormField>
              <FormField
                label="Areas of expertise / body areas (comma separated)"
                id="areas_of_expertise"
                error={errors["areas_of_expertise"]}
              >
                <Textarea
                  id="areas_of_expertise"
                  rows={2}
                  placeholder="Back, Legs, Core"
                  value={values.areas_of_expertise}
                  onChange={(e) => set("areas_of_expertise", e.target.value)}
                />
              </FormField>
              <FormField label="Profile image (JPG, PNG or WEBP, max 5MB)" id="profile_image" error={errors["profile_image"]}>
                <Input
                  id="profile_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </FormField>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Submitting application…" : "Submit trainer application"}
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
