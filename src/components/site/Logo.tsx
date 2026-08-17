import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/vybe-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex min-w-0 items-center gap-3", className)} aria-label="VYBE Fitness home">
      <img
        src={logoAsset.url}
        alt="VYBE Fitness logo"
        width={64}
        height={64}
        className="h-11 w-11 shrink-0 rounded-md object-cover object-center sm:h-12 sm:w-12"
      />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-display text-base sm:text-lg">VYBE Fitness</span>
        {!compact && (
          <span className="block truncate text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Your fitness. Your VYBE.
          </span>
        )}
      </span>
    </Link>
  );
}
