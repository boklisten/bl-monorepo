import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/auth/login/forgot")({
  beforeLoad: () => {
    throw redirect({
      to: "/auth/forgot",
    });
  },
});
