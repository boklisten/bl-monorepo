"use client";
import { useEffect } from "react";

import { logout } from "@/api/auth";

export default function AuthLogoutComponent() {
  useEffect(() => {
    logout();
  }, []);
  return null;
}
