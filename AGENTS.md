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

<!-- MIGRATION:PAIKARMART:BEGIN -->
# PaikarMart migration notes

- The PaikarMart frontend source (from github.com/absmunna/PaikarMart-web, apps/frontend/src) was merged into `src/`. It is a Vite SPA written for React Router; `react-router-dom` is NOT installed. Instead `src/vendor/react-router-dom.tsx` shims the used API (BrowserRouter, Routes/Route, Link, NavLink, Navigate, Outlet, useNavigate, useParams, useLocation, useSearchParams) over the History API. `Routes` always matches from the site root; route tables under a root splat parent keep absolute paths. Do not edit route logic assumptions without reading the shim.
- Path aliases that diverge from plain `@/* -> src/*` are declared BOTH in tsconfig.json paths and in vite.config.ts `resolve.alias` (PaikarMart prefixes win over the generic one): `@/components|hooks|lib|providers|router|api|store|context|guards|permissions|services|config|pages|types|constants` map into `src/app|core|shared|pages|design-system/...`; `@config/*` maps to the project root (firebase-applet-config.json); `@ui|@shared|@modules|@lib` map into src. Keep both lists in sync when adding aliases.
- The app is mounted client-side only via `src/paikarmart/Mount.tsx` (lazy `@/app/App` inside its own providers, after hydration) because PaikarMart touches browser APIs at module scope. `src/routes/index.tsx` serves `/` and `src/routes/$.tsx` is the catch-all for deep links (e.g. /market) — TanStack only supplies the document, the SPA owns all content paths. Do not statically import PaikarMart modules from TanStack SSR routes.
- TypeScript strictness is relaxed to match PaikarMart's authoring config (`strict: false`) but `strictNullChecks: true` stays on (TanStack Start tooling requires it).
- Tailwind: `src/styles.css` keeps the shadcn tokens and imports `src/design-system/styles/index.css` (PaikarMart theme). Their index.css must NOT import `tailwindcss` or remote fonts itself (font comes from the <link> in `src/routes/__root.tsx`).
- The Express/Prisma backend was NOT migrated. PaikarMart services call `VITE_API_BASE_URL` (unset: falls back to origin) plus Supabase/Firebase via VITE_ vars; configure those env vars when wiring a backend.
- `process.env.GEMINI_API_KEY` / `process.env.GOOGLE_MAPS_PLATFORM_KEY` are vite-defined to empty strings so browser code never crashes on `process.env` access.

# Route + theme decisions (2026-11-01)

- The router shim's nested `<Routes>` cannot match subpaths under a splat parent (it always matches the full pathname from site root), so every portal subpath is declared as a flat absolute route in `src/app/router/portal.routes.tsx` (e.g. `/b2b`, `/b2b/orders`, `/marketplace/product/:id`). Do not reintroduce nested `<Routes>` inside splat parents — they render nothing.
- All `--pm-*` theme tokens live per theme in `src/design-system/styles/themes/*.css`; `variables.css` only aggregates `@import`s (no rules — declarations glued after imports break Lightning CSS). Shared token aliases (`--pm-text-secondary`, `--pm-text-muted`, `--pm-surface-hover`, `--pm-card-hover`, `--pm-accent-soft`, `--pm-accent-2`, `--pm-success`, `--pm-danger`) exist in every theme file; when adding a new `--pm-*` token, add it to all theme files, not just one.
- Design direction: cleaner dark, mobile-first, single orange accent (`--pm-accent: #ff7a00`) with cyan only as sparing secondary (`--pm-accent-2`); portal-identity gradients in the marketplace hub banner are intentional exceptions.
