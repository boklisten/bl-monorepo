import { defineConfig, services } from "@adonisjs/ally";
import { createPath } from "@backend/lib/config/api-path.js";
import { BlEnv } from "@backend/lib/config/env.js";

const allyConfig = defineConfig({
  facebook: services.facebook({
    clientId: BlEnv.FACEBOOK_CLIENT_ID,
    clientSecret: BlEnv.FACEBOOK_SECRET,
    callbackUrl: BlEnv.BL_API_URI + createPath("auth/facebook/callback"),
  }),
  google: services.google({
    clientId: BlEnv.GOOGLE_CLIENT_ID,
    clientSecret: BlEnv.GOOGLE_SECRET,
    callbackUrl: BlEnv.BL_API_URI + createPath("auth/google/callback"),
  }),
});
export default allyConfig;
declare module "@adonisjs/ally/types" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
