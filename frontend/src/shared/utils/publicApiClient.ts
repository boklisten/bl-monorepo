import { createTuyau } from "@tuyau/core/client";
import { registry } from "@boklisten/backend/registry";
import { superjson } from "@tuyau/superjson/plugin";
import { createTuyauReactQueryClient } from "@tuyau/react-query";

import BL_CONFIG from "@/shared/utils/bl-config";

/**
 * API client with no authentication mechanisms, use useApiClient for authenticated requests
 */
export const publicApiClient = createTuyau({
  baseUrl: BL_CONFIG.api.basePath,
  registry,
  headers: { Accept: "application/json" },
  timeout: 60_000,
  plugins: [superjson()],
});

export const publicApi = createTuyauReactQueryClient({
  client: publicApiClient,
});
