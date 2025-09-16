import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function DatabaseReportsPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"database/reports"} />
    </Suspense>
  );
}
