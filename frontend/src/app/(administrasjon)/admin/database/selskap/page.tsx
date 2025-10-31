import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import CompanyManager from "@/features/companies/CompanyManager";

export const metadata: Metadata = {
  title: "Selskap",
};

export default function DatabaseCompaniesPage() {
  return (
    <AuthGuard requiredPermission={"admin"}>
      <CompanyManager />
    </AuthGuard>
  );
}
