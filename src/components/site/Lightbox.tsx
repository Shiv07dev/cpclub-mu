import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type Photo = { src: string; caption?: string | undefined; event?: string | undefined; year?: string | number | undefined };

export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  return { index, open: setIndex, close: () => setIndex(null), setIndex };
}

export function Lightbox({ photos, index, onClose, onIndex }: { photos: Photo[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const [zoom, setZoom] = useState(false);
  const n = photos.length;
  const go = useCallback((d: number) => { if (index === null) return; setZoom(false); onIndex((index + d + n) % n); }, [index, n, onIndex]);

  useEffect(() => {
    if (index === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [index, go, onClose]);

  if (index === null || !photos[index]) return null;
  const p = photos[index];
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[100] flex flex-col bg-navy/95 text-primary-foreground backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <span className="font-mono text-xs opacity-80">{index + 1} / {n}</span>
        <div className="flex gap-2">
          <button onClick={() => setZoom((z) => !z)} aria-label={zoom ? "Zoom out" : "Zoom in"} className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">{zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}</button>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"><X className="h-5 w-5" /></button>
        </div>
      </div>
      <div className={cn("relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16", zoom && "overflow-auto")}>
        <img
          src={p.src}
          alt={p.caption ?? p.event ?? "Event photo"}
          onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
          className={cn("rounded-xl object-contain shadow-lift transition-transform", zoom ? "max-h-none max-w-none scale-150 cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in")}
        />
        {n > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo" className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 sm:left-4"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo" className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 sm:right-4"><ChevronRight className="h-6 w-6" /></button>
          </>
        )}
      </div>
      <div className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        {p.event && <p className="font-semibold">{p.event}{p.year ? <span className="ml-2 font-mono text-xs opacity-70">{p.year}</span> : null}</p>}
        {p.caption && <p className="mt-1 text-sm opacity-80">{p.caption}</p>}
      </div>
    </div>
  );
}

/** Responsive photo grid that opens the lightbox on click. */
export function PhotoGrid({ photos, className, masonry = true }: { photos: Photo[]; className?: string; masonry?: boolean }) {
  const lb = useLightbox();
  return (
    <>
      <div className={cn(masonry ? "columns-1 gap-4 sm:columns-2 lg:columns-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {photos.map((p, i) => (
          <button key={p.src} onClick={() => lb.open(i)} className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-muted shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
            <img src={p.src} alt={p.caption ?? p.event ?? "Event photo"} loading="lazy" className={cn("w-full transition-transform duration-500 group-hover:scale-105", !masonry && "aspect-[4/3] object-cover")} />
            {(p.event || p.year) && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-3 pt-10 text-left text-xs font-semibold text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {p.event} {p.year && <span className="font-mono opacity-80">· {p.year}</span>}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox photos={photos} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </>
  );
}
