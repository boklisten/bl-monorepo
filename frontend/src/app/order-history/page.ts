"use client";

import { attachTokensToHref } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { redirect } from "next/navigation";

export default function OrdersPage() {
  redirect(attachTokensToHref(BL_CONFIG.blWeb.basePath + "u/order"));
}
