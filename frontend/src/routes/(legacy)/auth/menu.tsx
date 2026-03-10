import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/auth/menu")({
  beforeLoad: () => {
    throw redirect({
      to: "/auth/login",
    });
  },
});
