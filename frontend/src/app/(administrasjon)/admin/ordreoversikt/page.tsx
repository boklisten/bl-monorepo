"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function OrderManagerPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "order-manager");
}
