# PaikarMart — Cleaner UI + Marketplace/B2C Portal Design Plan

Choices confirmed with you: scope = **Marketplace/B2C portals**, direction = **cleaner dark**, **mobile-first**, and **fix the blank /b2b page**.

## 1. Fix the blank /b2b wholesale page

`/b2b` currently renders only the top bar and bottom nav — no content, no console errors.

Root cause found in the route table (`src/app/router/portal.routes.tsx` lines 95–119): the B2B routes use the pattern `<Route path="/b2b/*"><B2BLayout><Routes>...` — nested `Routes` tables match from the **site root** in this project's router shim (per the migration notes), so the inner `path="/"` matches `/`, never `/b2b`. Nothing renders. The same pattern exists for `/pk-shop/*` and `/marketplace/*` (those have an exact-route sibling that hides the problem).

Work:
- Read `src/vendor/react-router-dom.tsx` to confirm the supported nested-route behavior, then restructure the B2B (and identical-pattern pk-shop) route table so `/b2b` and its subpages render their screens.
- Verify `/b2b` shows the wholesale home on the phone preview.

## 2. Design-token refresh — "cleaner dark"

One visual direction, defined once in tokens so every portal page inherits it:

- `src/design-system/styles/themes/dark.css`: refine the `--pm-*` dark palette — deeper, softer background layers (`bg → surface → card`), one primary accent (PaikarMart orange) with a single muted secondary, calmer borders (lower-contrast hairlines), no rainbow glows.
- Add tokens the B2C screens currently fake with hardcoded classes (badge tints, brand tiles, sale ribbons) so they switch with the theme.
- Refactor the rare hardcoded utilities in shared layouts (e.g. `PortalLayout.tsx` uses `text-white`, `hover:bg-white/10`) to tokens.

## 3. Shared portal UI primitives (the "clean" system)

Create/reuse a small set of components so the pages stop inventing their own styling:

- **PortalPageHeader** — consistent back button, title, right-side actions (replaces the current per-page ad-hoc headers).
- **SectionHeader** — title + "see all" link, uniform spacing.
- **Badge/Tag variants** — one component for RETAIL/WHOLESALE/verified/price badges (today: orange, cyan, pink, blue, each hand-rolled).
- **Product card polish** — unified card for the marketplace feed and B2C grid: consistent radius, image ratio, price/feature row, single accent CTA.
- **Loading & empty states** — the home feed currently hangs on a spinner card; give every B2C screen proper skeletons (already exists: `ProductGridSkeleton`) and a designed empty state.

## 4. Apply to the B2C screens (mobile-first, 393px)

Visual cleanup only — navigation, cart, and page behavior stay identical:

- **/shop (`B2CHome.tsx`, 935 lines, ~50 hardcoded color utilities)** — remove stacked promo/notice banners (merge into one dismissible strip), tidy the search + trending-chip block, align the spotlight carousel, simplify brand circles and featured stores into tokenized components.
- **/marketplace (`MarketplaceHubPortal.tsx`, 551 lines, ~44 hardcoded utilities)** — slim the discovery hero, consistent filter chips row, consistent feed card spacing.
- **Product detail (`ProductDetailsView.tsx`, 808 lines)** — cleaner gallery, price/MOQ block, sticky buy bar in one accent color.
- Replace hardcoded color classes on these files with token classes as each section is touched.

## 5. Verification

- Playwright screenshots at phone size (393px) for `/`, `/shop`, `/marketplace`, `/b2b`, `/pk-shop` before and after, to confirm each page renders and reads cleaner.
- Zero console errors, typecheck + build OK.
- Record the route-table rule and token-first styling decision in `AGENTS.md`.
