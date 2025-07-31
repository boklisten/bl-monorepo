import { defineConfig, services } from "@adonisjs/ally";

import { VippsDriverService } from "#services/vipps_driver_service";
import env from "#start/env";

const allyConfig = defineConfig({
  facebook: services.facebook({
    clientId: env.get("FACEBOOK_CLIENT_ID"),
    clientSecret: env.get("FACEBOOK_SECRET"),
    callbackUrl: env.get("BL_API_URI") + "/auth/facebook/callback",
  }),
  google: services.google({
    clientId: env.get("GOOGLE_CLIENT_ID"),
    clientSecret: env.get("GOOGLE_SECRET"),
    callbackUrl: env.get("BL_API_URI") + "/auth/google/callback",
  }),
  vipps: VippsDriverService({
    environment: "production",
    clientId: env.get("VIPPS_CLIENT_ID"),
    clientSecret: env.get("VIPPS_SECRET"),
    callbackUrl: env.get("BL_API_URI") + "/v2/auth/vipps/callback",
    scopes: ["openid", "email", "phoneNumber", "address", "name"],
  }),
});
export default allyConfig;
declare module "@adonisjs/ally/types" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
