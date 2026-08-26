import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSupabase } from "@/integrations/supabase/admin-client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — VYBE Fitness Portal" },
      { name: "description", content: "Secure sign-in for VYBE Fitness administrators." },
      { property: "og:title", content: "Admin Login — VYBE Fitness" },
      { property: "og:description", content: "Secure sign-in for VYBE Fitness administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ email, password });
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

    const { data, error } = await adminSupabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      setSubmitting(false);
      toast.error(error?.message ?? "Unable to sign in");
      return;
    }

    // Server-side source of truth: the role row is protected by row level security.
    const { data: isAdmin } = await adminSupabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      await adminSupabase.auth.signOut({ scope: "local" });
      setSubmitting(false);
      toast.error("This account does not have administrator access.");
      return;
    }

    await queryClient.invalidateQueries();
    toast.success("Welcome back, administrator.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Admin Portal
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">Administrator sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restricted area. Authorised VYBE Fitness staff only.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vybefitness.com"
              />
              {errors['email'] && <p className="text-xs text-destructive">{errors['email']}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {errors['password'] && <p className="text-xs text-destructive">{errors['password']}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Admin accounts are provisioned internally. There is no self sign-up.
          </p>
        </div>
      </div>
    </main>
  );
}
