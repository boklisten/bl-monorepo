import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/u/edit")({
  beforeLoad: () => {
    throw redirect({
      to: "/user-settings",
    });
  },
});
