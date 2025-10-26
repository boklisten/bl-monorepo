import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function DatabaseCompaniesPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"database/companies"} />
    </Suspense>
  );
}
