"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function BulkCollectionPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "bulk");
}
