import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary", className)}>
      <span className="h-px w-6 bg-brand" />
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <div className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, sub, children }: { eyebrow: string; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] text-navy sm:text-5xl">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{sub}</p>}
        {children}
      </div>
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-6xl px-5", className)}>{children}</div>;
}

export function CodeChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-border bg-card/90 px-3 py-1 font-mono text-xs text-navy shadow-soft", className)}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft", className)}>{children}</div>;
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-extrabold text-brand">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
