"use client";
import { ReactNode, useEffect } from "react";

export default function DynamicHeightProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Dynamic height variable to fix stupid mobile browsers
  useEffect(() => {
    function setDynamicHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
    setDynamicHeight();
    window.addEventListener("resize", setDynamicHeight);
    return () => {
      window.removeEventListener("resize", setDynamicHeight);
    };
  }, []);
  return <>{children}</>;
}
