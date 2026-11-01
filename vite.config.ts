// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const src = (relative: string) => path.resolve(projectRoot, "src", relative);

// PaikarMart's source tree remaps a handful of `@/...` prefixes away from src/
// and expects react-router-dom to exist. Aliases are resolved in declaration
// order, so the specific PaikarMart prefixes are listed before the generic one.
const paikarMartAliases = [
  { find: /^react-router-dom$/, replacement: path.resolve(projectRoot, "src/vendor/react-router-dom.tsx") },
  { find: /^@config/, replacement: projectRoot },
  { find: /^@ui/, replacement: src("design-system/components/ui") },
  { find: /^@shared/, replacement: src("shared") },
  { find: /^@modules/, replacement: src("modules") },
  { find: /^@lib/, replacement: src("core/lib") },
  { find: /^@\/components(?=\/|$)/, replacement: src("design-system/components") },
  { find: /^@\/hooks(?=\/|$)/, replacement: src("shared/hooks") },
  { find: /^@\/lib(?=\/|$)/, replacement: src("core/lib") },
  { find: /^@\/providers(?=\/|$)/, replacement: src("app/providers") },
  { find: /^@\/router(?=\/|$)/, replacement: src("app/router") },
  { find: /^@\/api(?=\/|$)/, replacement: src("core/api") },
];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      // PaikarMart reads these at module scope in browser code; keep them
      // defined (empty) so `process.env` access never crashes the client.
      "process.env.GEMINI_API_KEY": JSON.stringify(process.env.GEMINI_API_KEY ?? ""),
      "process.env.GOOGLE_MAPS_PLATFORM_KEY": JSON.stringify(
        process.env.GOOGLE_MAPS_PLATFORM_KEY ?? ""
      ),
    },
    resolve: {
      alias: paikarMartAliases,
    },
  },
});
