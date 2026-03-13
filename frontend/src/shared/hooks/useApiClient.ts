import { createTuyau } from "@tuyau/core/client";
import { registry } from "@boklisten/backend/registry";
import { superjson } from "@tuyau/superjson/plugin";

import { login, logout } from "@/shared/hooks/useAuth";
import BL_CONFIG from "@/shared/utils/bl-config";
import { publicApiClient } from "@/shared/utils/publicApiClient";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { createTuyauReactQueryClient } from "@tuyau/react-query";

export default function useApiClient() {
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const client = createTuyau({
    baseUrl: BL_CONFIG.api.basePath,
    registry,
    headers: { Accept: "application/json" },
    timeout: 60_000,
    plugins: [superjson()],
    hooks: {
      beforeRequest: [
        (request) => {
          const accessToken = localStorage.getItem(BL_CONFIG.token.accessToken);
          if (accessToken) {
            request.headers.set("Authorization", `Bearer ${accessToken}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          function redirectToLogin() {
            logout();
            navigate({ to: "/auth/login", search: { redirect: pathname.slice(1) } });
            return new Response();
          }

          if (response.status === 403) {
            navigate({ to: "/auth/permission/denied" });
            return response;
          }

          if (response.status !== 401) {
            return response;
          }

          const refreshToken = localStorage.getItem(BL_CONFIG.token.refreshToken);
          if (request.headers.get("Authorization") === undefined || refreshToken === null) {
            return redirectToLogin();
          }

          try {
            const newTokens = await publicApiClient.api.tokens.token({
              body: {
                refreshToken,
              },
            });
            if (!newTokens) {
              return redirectToLogin();
            }
            login(newTokens);

            const retryRequest = new Request(request);
            retryRequest.headers.set("Authorization", `Bearer ${newTokens.accessToken}`);
            return fetch(retryRequest);
          } catch {
            return redirectToLogin();
          }
        },
      ],
    },
  });
  return {
    client,
    api: createTuyauReactQueryClient({
      client,
    }),
  };
}
