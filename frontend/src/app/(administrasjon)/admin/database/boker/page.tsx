"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function DatabaseBooksPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/books");
}
