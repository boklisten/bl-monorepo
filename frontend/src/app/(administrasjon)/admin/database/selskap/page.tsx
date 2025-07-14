"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function DatabaseCompaniesPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/companies");
}
