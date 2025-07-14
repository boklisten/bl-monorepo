"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function DatabaseReportsPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/reports");
}
