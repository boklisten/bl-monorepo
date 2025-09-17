import { Suspense } from "react";

import RedirectTo from "@/features/auth-linker/RedirectTo";

export default function InvoicesPage() {
  // apply auth guard once implemented       <AuthGuard requiredPermission={USER_PERMISSION.ADMIN} />
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"invoices"} />
    </Suspense>
  );
}
