import { Suspense } from "react";

import RedirectTo from "@/features/auth-linker/RedirectTo";

export default function DatabaseReportsPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"database/reports"} />
    </Suspense>
  );
}
