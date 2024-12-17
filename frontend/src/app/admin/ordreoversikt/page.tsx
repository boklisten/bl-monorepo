"use client";
import { redirect } from "next/navigation";

import { attachTokensToHref } from "@/components/AuthLinker";
import BL_CONFIG from "@/utils/bl-config";

export default function OrderManagerPage() {
  redirect(attachTokensToHref(BL_CONFIG.blAdmin.basePath + "order-manager"));
}
