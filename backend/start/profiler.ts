import * as Sentry from "@sentry/node";

import env from "#start/env";

if (env.get("API_ENV") !== "test") {
  Sentry.profiler.startProfiler();
}
