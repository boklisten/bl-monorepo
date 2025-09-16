"use client";

import useAuthLinker from "@/hooks/useAuthLinker";

export default function RedirectTo(props: {
  target: "bl-admin" | "bl-web";
  path: string;
  retainHistory?: boolean;
}) {
  const { redirectTo } = useAuthLinker();
  redirectTo(props.target, props.path, props.retainHistory);
  return null;
}
