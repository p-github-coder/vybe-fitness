import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Logo } from "@/components/site/Logo";
import { RoleGate } from "@/components/site/RoleGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { displayName, useAccount } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/trainer")({
  head: () => ({
    meta: [
      { title: "Trainer Area — VYBE Fitness" },
      { name: "description", content: "Your VYBE Fitness trainer area." },
      { property: "og:title", content: "Trainer Area — VYBE Fitness" },
      { property: "og:description", content: "Your VYBE Fitness trainer area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="trainer">
      <TrainerLanding />
    </RoleGate>
  ),
});

function TrainerLanding() {
  const { profile } = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
        <Logo className="mb-10" />
        <div className="surface-card p-8 sm:p-10">
          <p className="text-eyebrow">Trainer area</p>
          <h1 className="text-display mt-4 text-4xl">Welcome, {displayName(profile)}</h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Account status</span>
            <Badge className="capitalize">{profile?.account_status}</Badge>
          </div>
          <p className="mt-6 text-muted-foreground">Your trainer dashboard is coming in the next phase.</p>
          <Button className="mt-8" variant="secondary" onClick={() => void handleSignOut()}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
