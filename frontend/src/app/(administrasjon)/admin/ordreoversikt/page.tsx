"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function OrderManagerPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "order-manager");
}
