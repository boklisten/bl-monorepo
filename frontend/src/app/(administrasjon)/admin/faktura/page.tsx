"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function InvoicesPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "invoices");
  // apply auth guard once implemented       <AuthGuard requiredPermission={USER_PERMISSION.ADMIN} />
}
