"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function ScannerPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "scanner");
}
