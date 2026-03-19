import { createTuyau } from "@tuyau/core/client";
import { registry } from "@boklisten/backend/registry";
import { superjson } from "@tuyau/superjson/plugin";
import { createTuyauReactQueryClient } from "@tuyau/react-query";

/**
 * API client with no authentication mechanisms, use useApiClient for authenticated requests
 */
export const publicApiClient = createTuyau({
  baseUrl: import.meta.env["VITE_API_ENV"] ?? "",
  registry,
  headers: { Accept: "application/json" },
  timeout: 60_000,
  plugins: [superjson()],
});

export const publicApi = createTuyauReactQueryClient({
  client: publicApiClient,
});
