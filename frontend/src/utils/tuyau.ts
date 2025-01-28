// Type references
import("@boklisten/backend/config/ally");
import("@boklisten/backend/adonisrc");

import { api } from "@boklisten/backend/.adonisjs/api";
import { createTuyau } from "@tuyau/client";

import BL_CONFIG from "@/utils/bl-config";

export const tuyau = createTuyau({
  api,
  baseUrl: BL_CONFIG.api.basePath,
});
