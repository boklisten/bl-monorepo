"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function OrdersPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "u/order");
}
