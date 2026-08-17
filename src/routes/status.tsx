import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Clock, PauseCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { displayName, useAccount } from "@/lib/auth";

export const Route = createFileRoute("/status")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Account Status — VYBE Fitness" },
      { name: "description", content: "Check the review status of your VYBE Fitness account." },
      { property: "og:title", content: "Account Status — VYBE Fitness" },
      { property: "og:description", content: "Check the review status of your VYBE Fitness account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { session, profile, loading, hasRole } = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile?.account_status === "approved") {
      navigate({ to: hasRole("trainer") ? "/trainer" : "/member", replace: true });
    }
  }, [profile?.account_status, hasRole, navigate]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const isTrainer = hasRole("trainer");
  const status = profile?.account_status ?? "pending";

  const content = {
    pending: {
      icon: Clock,
      title: isTrainer ? "Application pending" : "Approval pending",
      body: isTrainer
        ? "Thanks for applying to coach at VYBE. Our team is reviewing your certifications and experience — you'll get access to your trainer area as soon as you're approved."
        : "Thanks for joining VYBE. Your membership is being reviewed by our team. You'll get access to your member area as soon as it's approved.",
    },
    rejected: {
      icon: XCircle,
      title: "Application not approved",
      body: "After review, we weren't able to approve this account. If you believe this is a mistake, contact our team and we'll take another look.",
    },
    suspended: {
      icon: PauseCircle,
      title: "Account suspended",
      body: "This account has been suspended and protected features are unavailable. Please contact our team to resolve it.",
    },
    approved: {
      icon: AlertTriangle,
      title: "Account approved",
      body: "Redirecting you to your area…",
    },
  }[status];

  const Icon = content.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <Logo className="mb-10 justify-center" />
        <div className="surface-card p-8 sm:p-10">
          <Icon className="h-9 w-9 text-primary" />
          <h1 className="text-display mt-6 text-3xl">{content.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hi {displayName(profile)} — here's where things stand.
          </p>
          <p className="mt-5 text-muted-foreground">{content.body}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Account type</dt>
              <dd className="mt-1 font-medium capitalize">{isTrainer ? "Trainer" : "Member"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Status</dt>
              <dd className="mt-1 font-medium capitalize text-primary">{status}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => void handleSignOut()}>
              Sign out
            </Button>
            <Button asChild variant="ghost">
              <Link to="/contact">Contact the team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
