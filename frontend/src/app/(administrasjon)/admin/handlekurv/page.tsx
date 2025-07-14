"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function CartPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "cart/customer");
}
