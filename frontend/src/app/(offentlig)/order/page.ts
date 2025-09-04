"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function OrderPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "fastbuy/regions");
}
