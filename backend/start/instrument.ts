import * as Sentry from "@sentry/node";
import { mongooseIntegration } from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import env from "#start/env";

if (env.get("API_ENV") !== "test") {
  Sentry.init({
    dsn: "https://7a394e7cab47142de06327e453c54837@o569888.ingest.us.sentry.io/4508653655293952",
    integrations: [nodeProfilingIntegration(), mongooseIntegration()],
    tracesSampleRate: 1.0,
    environment: env.get("API_ENV"),
    enabled: env.get("API_ENV") !== "dev",
  });
}
