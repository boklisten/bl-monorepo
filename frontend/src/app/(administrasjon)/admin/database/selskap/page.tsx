import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function DatabaseCompaniesPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"database/companies"} />
    </Suspense>
  );
}
