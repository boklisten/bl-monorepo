// Type references
// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="../../../../backend/config/ally.ts" />
// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="../../../../backend/adonisrc.ts" />

import { api } from "@boklisten/backend/.adonisjs";
import { createTuyau } from "@tuyau/client";
import { superjson } from "@tuyau/superjson/plugin";

import BL_CONFIG from "@/shared/utils/bl-config";

/**
 * API client with no authentication mechanisms, use useApiClient for authenticated requests
 */
export const publicApiClient = createTuyau({
  timeout: 60_000,
  api,
  baseUrl: BL_CONFIG.api.basePath,
  plugins: [superjson()],
});
