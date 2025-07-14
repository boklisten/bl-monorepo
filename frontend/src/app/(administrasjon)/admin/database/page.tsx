"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function DatabaseRootPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database");
  // apply auth guard once implemented       <AuthGuard requiredPermission={USER_PERMISSION.ADMIN} />
}
