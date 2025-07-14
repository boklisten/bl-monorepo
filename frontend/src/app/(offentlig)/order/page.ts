"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function OrderPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "fastbuy/regions");
}
