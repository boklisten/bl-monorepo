"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function ItemsPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "u/items");
}
