import { api } from "@backend/tuyau/api";
import { createTuyau } from "@tuyau/client";

import BL_CONFIG from "@/utils/bl-config";

export const tuyau = createTuyau({
  api,
  baseUrl: BL_CONFIG.api.basePath,
});
