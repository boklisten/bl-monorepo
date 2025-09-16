import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function DatabaseCompaniesPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"database/companies"} />
    </Suspense>
  );
}
