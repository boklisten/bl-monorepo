// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6ffc45d40e73d726fff078a70929a634@o569888.ingest.us.sentry.io/4508654849294336",
  tracesSampleRate: 1,
  debug: false,
});
