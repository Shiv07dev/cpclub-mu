// Real event photographs extracted from the club's formal event reports.
// Files are named ev-r{report}-{n}.webp in public/assets/events; `r` keys match seed-events.ts.
import { EVENT_PHOTO_FILES, eventPhoto } from "@/lib/assets";

const byReport: Record<string, string[]> = {};
for (const name of EVENT_PHOTO_FILES) {
  const m = name.match(/^ev-(r\d+)-\d+$/);
  if (m) (byReport[m[1]!] ??= []).push(eventPhoto(name));
}

export const photosFor = (report: string): string[] => byReport[report] ?? [];
