import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/minimaltab/NotFound";
import { logRouteFallback } from "@/lib/route-fallback";

export const Route = createFileRoute("/$")({
  // Unknown URLs never show a 404 screen — send them straight to the dashboard.
  beforeLoad: ({ location }) => {
    logRouteFallback({
      reason: "unmatched-route",
      from: location.href,
      to: "/",
    });
    throw redirect({
      to: "/",
      replace: true,
      search: { fallback: location.pathname },
    });
  },
  head: () => ({
    meta: [
      { title: "Redirecting — MinimalTab" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <NotFound autoRedirect />,
});
