import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/auth/register/detail")({
  beforeLoad: () => {
    throw redirect({
      to: "/user-settings",
    });
  },
});
