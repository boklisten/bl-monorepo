"use client";

import { attachTokensToHref } from "@frontend/components/AuthLinker";
import BL_CONFIG from "@frontend/utils/bl-config";
import { redirect } from "next/navigation";

export default function IndexPage() {
  redirect(attachTokensToHref(BL_CONFIG.blWeb.basePath));
}
