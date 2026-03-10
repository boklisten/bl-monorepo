import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/auth/success")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
    });
  },
});
