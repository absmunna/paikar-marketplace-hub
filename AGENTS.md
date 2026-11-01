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
- The app is mounted client-side only in `src/routes/index.tsx` (lazy `@/app/App` after hydration) because PaikarMart touches browser APIs at module scope. Do not statically import PaikarMart modules from TanStack SSR routes.
- TypeScript strictness is relaxed to match PaikarMart's authoring config (`strict: false`) but `strictNullChecks: true` stays on (TanStack Start tooling requires it).
- Tailwind: `src/styles.css` keeps the shadcn tokens and imports `src/design-system/styles/index.css` (PaikarMart theme). Their index.css must NOT import `tailwindcss` or remote fonts itself (font comes from the <link> in `src/routes/__root.tsx`).
- The Express/Prisma backend was NOT migrated. PaikarMart services call `VITE_API_BASE_URL` (unset: falls back to origin) plus Supabase/Firebase via VITE_ vars; configure those env vars when wiring a backend.
- `process.env.GEMINI_API_KEY` / `process.env.GOOGLE_MAPS_PLATFORM_KEY` are vite-defined to empty strings so browser code never crashes on `process.env` access.
