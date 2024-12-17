"use client";

import { attachTokensToHref } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { redirect } from "next/navigation";

export default function DatabaseBranchesPage() {
  redirect(
    attachTokensToHref(BL_CONFIG.blAdmin.basePath + "database/branches"),
  );
}
