import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const memberLinks = [
  { to: "/member", label: "Dashboard", exact: true },
  { to: "/member/plan", label: "My Plan", exact: false },
  { to: "/member/progress", label: "Progress", exact: false },
  { to: "/member/profile", label: "Fitness Profile", exact: false },
  { to: "/equipment", label: "Equipment", exact: false },
  { to: "/exercises", label: "Exercises", exact: false },
] as const;

export function MemberShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <Button variant="secondary" size="sm" onClick={() => void handleSignOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
          {memberLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "text-primary border-primary" }}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function MatchBadge({ score }: { score: number }) {
  return (
    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
      {score}% match
    </span>
  );
}
