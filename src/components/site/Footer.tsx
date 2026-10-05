import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { CLUB, INSTAGRAM, LOGO_URL } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src={LOGO_URL} alt="CP Club" className="h-10 w-auto max-w-[200px] object-contain" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {CLUB.department}, {CLUB.university}.
          </p>
          <p className="mt-4 font-mono text-xs tracking-[0.25em] text-primary">BUILD | PRACTICE | EXCEL</p>
        </div>
        <div className="grid gap-2 text-sm">
          <span className="font-semibold text-navy">Explore</span>
          <Link to="/coder-of-the-month" className="text-muted-foreground hover:text-navy">Coder of the Month</Link>
          <Link to="/monthly-contest" className="text-muted-foreground hover:text-navy">Monthly Coding Contest</Link>
          <Link to="/placements" className="text-muted-foreground hover:text-navy">Placement Records</Link>
          <Link to="/gate" className="text-muted-foreground hover:text-navy">GATE Qualifications</Link>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <span className="font-semibold text-navy">Connect</span>
          <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy">
            <Instagram className="h-4 w-4" /> {INSTAGRAM.handle}
          </a>
          <Link to="/contact" className="text-muted-foreground hover:text-navy">Contact us</Link>
          <Link to="/join" className="text-muted-foreground hover:text-navy">Join the club</Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {CLUB.name} · {CLUB.university}
      </div>
    </footer>
  );
}
