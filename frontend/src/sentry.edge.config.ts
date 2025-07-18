// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6ffc45d40e73d726fff078a70929a634@o569888.ingest.us.sentry.io/4508654849294336",
  sendDefaultPii: true,
  tracesSampleRate: 1,
  debug: false,
});
