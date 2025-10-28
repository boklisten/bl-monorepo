"use client";

import { useEffect } from "react";

import { logout } from "@/shared/hooks/useAuth";

export default function AuthLogoutComponent() {
  useEffect(() => {
    logout();
  }, []);

  return null;
}
