import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(legacy)/database/companies")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin/database/selskap",
    });
  },
});
