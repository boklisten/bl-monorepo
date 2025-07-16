/* eslint-disable @typescript-eslint/triple-slash-reference */

// Type references
/// <reference path="../../../../backend/config/ally.ts" />
/// <reference path="../../../../backend/adonisrc.ts" />

import { api } from "@boklisten/backend/.adonisjs";
import { createTuyau } from "@tuyau/client";
import { superjson } from "@tuyau/superjson/plugin";
import { usePathname, useRouter } from "next/navigation";

import {
  addAccessToken,
  addRefreshToken,
  getAccessToken,
  getRefreshToken,
} from "@/api/token";
import { publicApiClient } from "@/utils/api/publicApiClient";
import BL_CONFIG from "@/utils/bl-config";

export default function useApiClient() {
  const router = useRouter();
  const pathname = usePathname();

  return createTuyau({
    timeout: 60_000,
    api,
    baseUrl: BL_CONFIG.api.basePath,
    plugins: [superjson()],
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
          function redirectToLogin() {
            localStorage.clear();
            router.push("/auth/login?redirect=" + pathname.slice(1));
            return new Response();
          }

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

          try {
            const newTokens = await publicApiClient.v2.token
              .$post({
                refreshToken,
              })
              .unwrap();
            addAccessToken(newTokens.accessToken);
            addRefreshToken(newTokens.refreshToken);

            const retryRequest = new Request(request);
            retryRequest.headers.set(
              "Authorization",
              `Bearer ${newTokens.accessToken}`,
            );
            return fetch(retryRequest);
          } catch {
            return redirectToLogin();
          }
        },
      ],
    },
  });
}
