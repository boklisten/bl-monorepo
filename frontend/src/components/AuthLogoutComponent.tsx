"use client";

import { useEffect } from "react";

import useAuth from "@/hooks/useAuth";

export default function AuthLogoutComponent() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}
