import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/minimaltab/NotFound";

export const Route = createFileRoute("/$")({
  // Unknown URLs never show a 404 screen — send them straight to the dashboard.
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
  head: () => ({
    meta: [
      { title: "Redirecting — MinimalTab" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <NotFound autoRedirect />,
});
