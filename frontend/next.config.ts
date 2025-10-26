import { SentryBuildOptions, withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const NEXT_CONFIG = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  transpilePackages: ["@boklisten/backend"],
  turbopack: {
    resolveAlias: {
      "@/*": "./src/*",
      "@boklisten/backend/*": "../backend/src/*",
    },
  },
  // fixme: temporary redirects required while in tandem with bl-web / bl-admin
  async redirects() {
    return [
      {
        source: "/auth/login/forgot",
        destination: "/auth/forgot",
        permanent: false,
      },
      {
        source: "/auth/menu",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/auth/success",
        destination: "/",
        permanent: false,
      },
      {
        source: "/auth/social/failure",
        destination: "/auth/failure",
        permanent: false,
      },
      {
        source: "/auth/register/detail",
        destination: "/user-settings",
        permanent: false,
      },
      {
        source: "/u/edit",
        destination: "/user-settings",
        permanent: false,
      },
    ];
  },
} as const satisfies NextConfig;

const SENTRY_CONFIG = {
  org: "boklisten",
  project: "frontend",
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
  telemetry: false,
} as const satisfies SentryBuildOptions;

export default process.env["NEXT_PUBLIC_APP_ENV"] === "production"
  ? withSentryConfig(NEXT_CONFIG, SENTRY_CONFIG)
  : NEXT_CONFIG;
