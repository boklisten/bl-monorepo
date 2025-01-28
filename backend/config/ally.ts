import { defineConfig, services } from "@adonisjs/ally";

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
});
export default allyConfig;
declare module "@adonisjs/ally/types" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
