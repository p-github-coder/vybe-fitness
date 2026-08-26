import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — VYBE Fitness Member Access" },
      { name: "description", content: "Sign in to your VYBE Fitness account to access your member or trainer area." },
      { property: "og:title", content: "Login — VYBE Fitness" },
      { property: "og:description", content: "Sign in to your VYBE Fitness account." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/member", replace: true });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Those details didn't match an account. Check your email and password.");
      return;
    }
    const userId = data.user?.id;
    if (!userId) {
      toast.error("This account could not be verified.");
      return;
    }
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const hasPublicRole =
      !roleError && (roles ?? []).some((row) => row.role === "member" || row.role === "trainer");
    if (!hasPublicRole) {
      await supabase.auth.signOut({ scope: "local" });
      setSubmitting(false);
      toast.error("This sign-in is only for members and trainers.");
      return;
    }
    await queryClient.invalidateQueries();
    const isTrainer = (roles ?? []).some((row) => row.role === "trainer");
    navigate({ to: isTrainer ? "/trainer" : "/member", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <Logo className="mb-10 justify-center" />
        <div className="surface-card p-7 sm:p-9">
          <h1 className="text-display text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your training.</p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors["email"] && <p className="text-sm text-destructive">{errors["email"]}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors["password"] && <p className="text-sm text-destructive">{errors["password"]}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to VYBE?{" "}
            <Link to="/join" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <Link to="/" className="mt-8 text-center text-sm text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
