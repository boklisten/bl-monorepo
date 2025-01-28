/* eslint-disable @typescript-eslint/triple-slash-reference */

// Type references
/// <reference path="../../../backend/config/ally.ts" />
/// <reference path="../../../backend/adonisrc.ts" />

import { api } from "@boklisten/backend/.adonisjs/api";
import { createTuyau } from "@tuyau/client";

import BL_CONFIG from "@/utils/bl-config";

export const tuyau = createTuyau({
  api,
  baseUrl: BL_CONFIG.api.basePath,
});
