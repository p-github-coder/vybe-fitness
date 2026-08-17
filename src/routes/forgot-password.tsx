import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — VYBE Fitness" },
      { name: "description", content: "Request a password reset link for your VYBE Fitness account." },
      { property: "og:title", content: "Reset Your Password — VYBE Fitness" },
      { property: "og:description", content: "Request a password reset link for your VYBE Fitness account." },
    ],
  }),
  component: ForgotPassword,
});

const schema = z.string().trim().email("Enter a valid email address");

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (resetError) {
      toast.error("We couldn't send the reset email. Please try again shortly.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <Logo className="mb-10 justify-center" />
        <div className="surface-card p-7 sm:p-9">
          <h1 className="text-display text-3xl">Reset password</h1>
          {sent ? (
            <p className="mt-4 text-sm text-muted-foreground">
              If an account exists for {email}, a reset link is on its way. Check your inbox and spam
              folder.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to set a new password.
              </p>
              <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}
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
