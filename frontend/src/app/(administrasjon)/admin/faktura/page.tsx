"use client";

import { attachTokensToHref } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { redirect } from "next/navigation";

export default function InvoicesPage() {
  redirect(attachTokensToHref(BL_CONFIG.blAdmin.basePath + "invoices"));
  // apply permission guard once implemented       <PagePermissionGuard requiredPermission={"admin"} />
}
