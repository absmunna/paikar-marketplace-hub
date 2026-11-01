import { createFileRoute } from "@tanstack/react-router";

import { PaikarMartMount } from "@/paikarmart/Mount";

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
  component: PaikarMartMount,
});
