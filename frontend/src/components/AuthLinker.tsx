"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { addAccessToken, addRefreshToken } from "@/api/token";

export default function AuthLinker({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [authProcessed, setAuthProcessed] = useState(false);

  useEffect(() => {
    const refresh_token = searchParameters.get("refresh_token");
    const access_token = searchParameters.get("access_token");

    if (refresh_token && access_token) {
      addAccessToken(access_token);
      addRefreshToken(refresh_token);
      // Clear tokens from search params
      const params = new URLSearchParams(searchParameters.toString());
      params.delete("refresh_token");
      params.delete("access_token");
      // @ts-expect-error fixme: bad routing types
      router.replace(pathname + "?" + params);
    }
    setAuthProcessed(true);
  }, [pathname, router, searchParameters]);

  if (!authProcessed) {
    return null;
  }
  return <>{children}</>;
}
