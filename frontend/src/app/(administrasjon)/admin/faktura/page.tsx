import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function InvoicesPage() {
  // apply auth guard once implemented       <AuthGuard requiredPermission={USER_PERMISSION.ADMIN} />
  return (
    <Suspense>
      <RedirectToBlAdmin path={"invoices"} />
    </Suspense>
  );
}
