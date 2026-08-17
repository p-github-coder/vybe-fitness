import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password — VYBE Fitness" },
      { name: "description", content: "Choose a new password for your VYBE Fitness account." },
      { property: "og:title", content: "Set a New Password — VYBE Fitness" },
      { property: "og:description", content: "Choose a new password for your VYBE Fitness account." },
    ],
  }),
  component: ResetPassword,
});

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0]);
        if (!next[key]) next[key] = i.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      toast.error("We couldn't update your password. Request a new reset link and try again.");
      return;
    }
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/member", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <Logo className="mb-10 justify-center" />
        <div className="surface-card p-7 sm:p-9">
          <h1 className="text-display text-3xl">New password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password you haven't used elsewhere.
          </p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors["password"] && <p className="text-sm text-destructive">{errors["password"]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {errors["confirm"] && <p className="text-sm text-destructive">{errors["confirm"]}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
