import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/site/Logo";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/about", label: "About" },
      { to: "/membership", label: "Membership" },
      { to: "/trainers", label: "Trainers" },
      { to: "/classes", label: "Classes" },
    ],
  },
  {
    title: "Get started",
    links: [
      { to: "/join", label: "Join Now" },
      { to: "/auth", label: "Login" },
      { to: "/contact", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            A premium training floor in Victoria Island, Lagos — built for people who take their
            progress seriously.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-eyebrow mb-4">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VYBE Fitness. Your fitness. Your VYBE.
          </p>
          <Link to="/admin" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>

    </footer>
  );
}
