import { registry } from "@boklisten/backend/registry";
import { createTuyau } from "@tuyau/core/client";
import { superjson } from "@tuyau/superjson/plugin";

import BL_CONFIG from "@/shared/utils/bl-config";

/**
 * API client with no authentication mechanisms, use useApiClient for authenticated requests
 */
export const publicApiClient = createTuyau({
  timeout: 60_000,
  registry,
  baseUrl: BL_CONFIG.api.basePath,
  plugins: [superjson()],
});
