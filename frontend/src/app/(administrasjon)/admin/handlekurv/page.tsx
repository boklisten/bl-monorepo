"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function CartPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "cart/customer");
}
