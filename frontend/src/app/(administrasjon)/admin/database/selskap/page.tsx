"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function DatabaseCompaniesPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/companies");
}
