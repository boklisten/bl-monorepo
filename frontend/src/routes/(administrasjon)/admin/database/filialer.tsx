import BranchManager from "@/features/branches/BranchManager";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/database/filialer")({
  head: () => ({
    meta: [{ title: "Filialer | bl-admin" }],
  }),
  component: DatabaseBranchesPage,
});

function DatabaseBranchesPage() {
  return <BranchManager />;
}
