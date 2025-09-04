"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function IndexPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "");
}
