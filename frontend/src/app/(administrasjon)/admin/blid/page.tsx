"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function BlidSearchPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "blid");
}
