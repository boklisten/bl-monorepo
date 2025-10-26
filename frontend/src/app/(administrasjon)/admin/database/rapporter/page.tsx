import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function DatabaseReportsPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"database/reports"} />
    </Suspense>
  );
}
