/* eslint-disable @typescript-eslint/triple-slash-reference */

// Type references
/// <reference path="../../../backend/config/ally.ts" />
/// <reference path="../../../backend/adonisrc.ts" />

import { api } from "@boklisten/backend/.adonisjs";
import { createTuyau } from "@tuyau/client";
import { superjson } from "@tuyau/superjson/plugin";

import BL_CONFIG from "@/utils/bl-config";

/**
 * API client with no authentication mechanisms, use useApiClient for authenticated requests
 */
export const publicApiClient = createTuyau({
  timeout: 60_000,
  api,
  baseUrl: BL_CONFIG.api.basePath,
  plugins: [superjson()],
});
