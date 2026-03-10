import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/welcome")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
    });
  },
});
