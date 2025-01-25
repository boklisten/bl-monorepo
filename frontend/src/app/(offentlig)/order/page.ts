"use client";

import { redirect } from "next/navigation";

import { attachTokensToHref } from "@/components/AuthLinker";
import BL_CONFIG from "@/utils/bl-config";

export default function OrderPage() {
  redirect(attachTokensToHref(BL_CONFIG.blWeb.basePath + "fastbuy/regions"));
}
