<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- UI never calls fetch directly; all data goes through `src/lib/api/services.ts` (mock localStorage when `VITE_API_BASE_URL` is unset, HTTP otherwise) so the external backend can be plugged in without UI changes.
- Static, verified club content (people, achievements, placements) lives in `src/lib/content.ts`, sourced only from club-provided material — never invent entries.
- Admin routes live under `/admin` and render without the public navbar/footer (switched in `__root.tsx`).
- Report-backed events (date, venue, attendance, overview, outcomes) live in `src/lib/api/seed-events.ts`; their photos are matched by filename (`ev-r{n}-*.webp`) via `src/lib/event-photos.ts` — keeps data and media decoupled.
- Community showcase data lives in `src/lib/community.ts`; shared fullscreen photo viewer is `src/components/site/Lightbox.tsx` — reuse it for any clickable photo.
- All site images live as real files under `public/assets/<category>/` and are referenced only through `src/lib/assets.ts` — the downloaded codebase must run locally with no hosted asset CDN; never add `.asset.json` pointers for site images.
