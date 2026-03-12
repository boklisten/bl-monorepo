import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";
import ErrorBoundary from "@/features/layout/ErrorBoundary.tsx";
import NotFoundPage from "@/features/NotFoundPage.tsx";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error }) => <ErrorBoundary error={error} withLogo href={"/"} />,
    defaultNotFoundComponent: NotFoundPage,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://6ffc45d40e73d726fff078a70929a634@o569888.ingest.us.sentry.io/4508654849294336",
      sendDefaultPii: true,
      integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
          colorScheme: "system",
        }),
      ],
      enableLogs: true,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
  return router;
}
