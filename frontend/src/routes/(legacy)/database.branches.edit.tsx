import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/database/branches/edit")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin/database/filialer",
    });
  },
});
