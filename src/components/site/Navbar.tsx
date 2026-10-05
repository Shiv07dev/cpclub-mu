import { Link } from "@tanstack/react-router";
import { Menu, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { LOGO_URL } from "@/lib/content";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/achievements", label: "Achievements" },
  { to: "/committee", label: "Committee" },
  { to: "/history", label: "History" },
  { to: "/monthly-contest", label: "Monthly Contest" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "glass border-b border-primary/15 shadow-soft" : "border-b border-transparent bg-background/70 backdrop-blur-md")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-brand" aria-hidden />
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300", scrolled ? "h-16" : "h-20")}>
        <Link to="/" className="flex shrink-0 items-center transition-transform hover:scale-[1.02]" aria-label="CP Club home">
          <img src={LOGO_URL} alt="Competitive Programming Club — Learn · Solve · Grow" className={cn("w-auto object-contain transition-all duration-300", scrolled ? "h-10" : "h-11 sm:h-14")} />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-primary/15 bg-card/80 p-1 shadow-soft xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-cyan-soft hover:text-navy data-[status=active]:bg-brand data-[status=active]:text-primary-foreground data-[status=active]:shadow-lift"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/join" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lift transition-all hover:-translate-y-0.5">
            Join Club
          </Link>
          <Link to="/admin" className="hidden h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-card text-navy transition-colors hover:border-primary hover:text-primary sm:inline-flex" aria-label="Admin" title="Admin">
            <Lock className="h-4 w-4" />
          </Link>
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-card text-navy xl:hidden" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="glass border-t border-border xl:hidden">
          <nav className="mx-auto grid max-w-6xl gap-1 px-5 py-3">
            {[...NAV, { to: "/join", label: "Join Club" } as const, { to: "/admin", label: "Admin" } as const].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-muted data-[status=active]:bg-cyan-soft">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
