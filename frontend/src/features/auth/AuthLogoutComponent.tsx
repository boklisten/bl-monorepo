"use client";

import { useEffect } from "react";

import useAuth from "@/features/auth/useAuth";

export default function AuthLogoutComponent() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}
