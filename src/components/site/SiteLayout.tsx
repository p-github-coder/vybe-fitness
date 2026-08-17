import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border pt-32 pb-16 sm:pt-40 sm:pb-24">
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-veil)" }} />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-eyebrow">{eyebrow}</p>
        <h1 className="text-display mt-4 text-4xl sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
