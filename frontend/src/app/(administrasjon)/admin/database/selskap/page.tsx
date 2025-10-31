import { Metadata } from "next";

import CompanyManager from "@/features/companies/CompanyManager";

export const metadata: Metadata = {
  title: "Selskap",
};

export default function DatabaseCompaniesPage() {
  return <CompanyManager />;
}
