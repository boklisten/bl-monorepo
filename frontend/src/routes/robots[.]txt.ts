import { createFileRoute } from "@tanstack/react-router";
import { isProduction } from "@/shared/utils/env";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const productionRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /health`;
        const stagingRobots = `User-agent: *
Disallow: /`;

        return new Response(isProduction() ? productionRobots : stagingRobots, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
