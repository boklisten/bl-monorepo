"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function DatabaseReportsPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/reports");
}
