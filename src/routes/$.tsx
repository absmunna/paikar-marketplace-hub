import { createFileRoute } from "@tanstack/react-router";

import { PaikarMartMount } from "@/paikarmart/Mount";

// The PaikarMart SPA owns every content path below /, so the TanStack shell
// only provides the document. "/" is the index route; this catch-all serves
// every deep link (e.g. /market, /product/123) with the same mounted SPA.
export const Route = createFileRoute("/$")({
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
  component: PaikarMartMount,
});
