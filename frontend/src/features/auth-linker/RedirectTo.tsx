"use client";

import { useEffect } from "react";

import useAuthLinker from "@/shared/hooks/useAuthLinker";

export default function RedirectTo(props: {
  target: "bl-admin" | "bl-web";
  path: string;
  retainHistory?: boolean;
}) {
  const { redirectTo } = useAuthLinker();
  useEffect(() => {
    redirectTo(props.target, props.path, props.retainHistory);
  }, [props.path, props.retainHistory, props.target, redirectTo]);
  return null;
}
