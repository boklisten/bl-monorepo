"use client";
import { logout } from "@frontend/api/auth";
import { useEffect } from "react";

export default function AuthLogoutComponent() {
  useEffect(() => {
    logout();
  }, []);
  return null;
}
