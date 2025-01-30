/* eslint-disable @typescript-eslint/triple-slash-reference */

// Type references
/// <reference path="../../../backend/config/ally.ts" />
/// <reference path="../../../backend/adonisrc.ts" />

import { api } from "@boklisten/backend/.adonisjs";
import { createTuyau } from "@tuyau/client";
import { usePathname, useRouter } from "next/navigation";

import {
  addAccessToken,
  addRefreshToken,
  getAccessToken,
  getRefreshToken,
} from "@/api/token";
import BL_CONFIG from "@/utils/bl-config";

export default function useApiClient() {
  const router = useRouter();
  const pathname = usePathname();

  function redirectToLogin() {
    localStorage.clear();
    router.push("/auth/login?redirect=" + pathname.slice(1));
    return new Response();
  }

  return createTuyau({
    api,
    baseUrl: BL_CONFIG.api.basePath,
    hooks: {
      beforeRequest: [
        (request) => {
          const token = getAccessToken();
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 403) {
            router.push("/auth/permission/denied");
            return response;
          }

          if (response.status !== 401) {
            return response;
          }

          const refreshToken = getRefreshToken();
          if (
            request.headers.get("Authorization") === undefined ||
            refreshToken === null
          ) {
            return redirectToLogin();
          }
          const tokenResponse = await createTuyau({
            api,
            baseUrl: BL_CONFIG.api.basePath,
          }).token.$post({ refreshToken });
          if (!tokenResponse.response.ok) {
            return redirectToLogin();
          }
          // fixme improve token endpoint typing
          const tokens = tokenResponse.data?.data as unknown as [
            {
              accessToken: string;
            },
            {
              refreshToken: string;
            },
          ];
          const accessToken = tokens[0].accessToken;
          addAccessToken(tokens[0].accessToken);
          addRefreshToken(tokens[1].refreshToken);

          const retryResponse = await fetch(request.url, {
            body: request.body,
            method: request.method,
            headers: {
              ...request.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (retryResponse.ok) {
            return retryResponse;
          }

          if (retryResponse.status === 403) {
            router.push("/auth/permission/denied");
          }

          // If we get here, something went terribly wrong and an error will be thrown where the request was initiated
          // Sentry will capture and log it
          return retryResponse;
        },
      ],
    },
  });
}
