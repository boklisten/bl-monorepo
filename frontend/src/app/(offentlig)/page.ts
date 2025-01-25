"use client";

import { redirect } from "next/navigation";

import { attachTokensToHref } from "@/components/AuthLinker";
import BL_CONFIG from "@/utils/bl-config";

export default function IndexPage() {
  redirect(attachTokensToHref(BL_CONFIG.blWeb.basePath));
}
