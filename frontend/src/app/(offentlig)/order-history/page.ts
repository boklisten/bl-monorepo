"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function OrdersPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "u/order");
}
