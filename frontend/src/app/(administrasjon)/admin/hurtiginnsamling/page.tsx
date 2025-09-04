"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function BulkCollectionPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "bulk");
}
