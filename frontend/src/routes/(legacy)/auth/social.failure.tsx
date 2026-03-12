import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/auth/social/failure")({
  beforeLoad: () => {
    throw redirect({
      to: "/auth/failure",
    });
  },
});
