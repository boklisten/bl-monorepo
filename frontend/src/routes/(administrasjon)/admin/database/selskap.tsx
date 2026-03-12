import { createFileRoute } from "@tanstack/react-router";
import AuthGuard from "@/features/auth/AuthGuard.tsx";
import CompanyManager from "@/features/companies/CompanyManager.tsx";

export const Route = createFileRoute("/(administrasjon)/admin/database/selskap")({
  head: () => ({
    meta: [{ title: "Selskap | bl-admin" }],
  }),
  component: DatabaseCompaniesPage,
});

function DatabaseCompaniesPage() {
  return (
    <AuthGuard requiredPermission={"admin"}>
      <CompanyManager />
    </AuthGuard>
  );
}
