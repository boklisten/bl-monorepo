import { assertEnv, BlEnvironment } from "@backend/config/environment";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://7a394e7cab47142de06327e453c54837@o569888.ingest.us.sentry.io/4508653655293952",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  enabled: assertEnv(BlEnvironment.API_ENV) === "production",
});
