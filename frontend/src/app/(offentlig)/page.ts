"use client";

import useAuthLinker from "@/utils/useAuthLinker";

export default function IndexPage() {
  const { redirectTo } = useAuthLinker();
  redirectTo("bl-web", "");
}
