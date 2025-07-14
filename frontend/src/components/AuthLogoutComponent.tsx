"use client";

import { useEffect } from "react";

import useAuth from "@/utils/useAuth";

export default function AuthLogoutComponent() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}
