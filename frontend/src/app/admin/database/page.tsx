"use client";

import { attachTokensToHref } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { redirect } from "next/navigation";

export default function DatabaseRootPage() {
  redirect(attachTokensToHref(BL_CONFIG.blAdmin.basePath + "database"));
  // apply permission guard once implemented       <PagePermissionGuard requiredPermission={"admin"} />
}
