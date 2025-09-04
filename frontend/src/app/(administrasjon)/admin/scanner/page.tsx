"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function ScannerPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "scanner");
}
