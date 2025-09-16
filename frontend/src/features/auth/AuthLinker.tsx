"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { addAccessToken, addRefreshToken } from "@/shared/utils/token";

export default function AuthLinker() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();

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
  }, [pathname, router, searchParameters]);

  return null;
}
