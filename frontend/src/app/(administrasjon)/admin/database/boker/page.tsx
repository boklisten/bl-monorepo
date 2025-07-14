"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function DatabaseBooksPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "database/books");
}
