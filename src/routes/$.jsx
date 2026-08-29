import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/minimaltab/NotFound";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — MinimalTab" },
      { name: "description", content: "This MinimalTab page doesn't exist. Head back to your dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found — MinimalTab" },
      { property: "og:description", content: "This MinimalTab page doesn't exist. Head back to your dashboard." },
    ],
  }),
  component: () => <NotFound />,
});
