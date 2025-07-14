"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function BlidSearchPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "blid");
}
