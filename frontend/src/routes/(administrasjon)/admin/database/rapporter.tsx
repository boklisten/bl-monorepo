import { createFileRoute } from "@tanstack/react-router";
import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin.tsx";

export const Route = createFileRoute("/(administrasjon)/admin/database/rapporter")({
  component: DatabaseReportsPage,
});

function DatabaseReportsPage() {
  return <RedirectToBlAdmin path={"database/reports"} />;
}
