"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function AdminUserPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-admin", "user");
}
