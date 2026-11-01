import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// The PaikarMart app is a client-side SPA (it owns its own history via the
// react-router-dom shim), so it mounts only after hydration in the browser.
const PaikarMartApp = lazy(() => import("@/app/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paikar Mart" },
      {
        name: "description",
        content:
          "Multi-vendor scalable marketplace platform for Bangladesh, supporting wholesale, retail, nearby shops, and services.",
      },
      { property: "og:title", content: "Paikar Mart" },
      {
        property: "og:description",
        content:
          "Multi-vendor scalable marketplace platform for Bangladesh, supporting wholesale, retail, nearby shops, and services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: "var(--pm-bg, #fcfbf8)" }} />;
  }

  return (
    <Suspense
      fallback={<div className="min-h-screen" style={{ backgroundColor: "var(--pm-bg, #fcfbf8)" }} />}
    >
      <PaikarMartApp />
    </Suspense>
  );
}
