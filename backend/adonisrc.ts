import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
  commands: [
    () => import("@adonisjs/core/commands"),
    () => import("@tuyau/core/commands"),
  ],
  providers: [
    () => import("@adonisjs/core/providers/app_provider"),
    () => import("@adonisjs/core/providers/hash_provider"),
    {
      file: () => import("@adonisjs/core/providers/repl_provider"),
      environment: ["repl", "test"],
    },
    () => import("@adonisjs/core/providers/vinejs_provider"),
    () => import("@adonisjs/cors/cors_provider"),
    () => import("@adonisjs/ally/ally_provider"),
    () => import("@tuyau/core/tuyau_provider"),
    () => import("@adonisjs/static/static_provider"),
  ],

  preloads: [
    () => import("#start/instrument"),
    () => import("#start/auth"),
    () => import("#start/routes"),
    () => import("#start/kernel"),
    () => import("#start/database"),
    () => import("#start/profiler"),
  ],

  tests: {
    suites: [
      {
        files: ["tests/**/*.spec.ts"],
        name: "unit",
        timeout: 2000,
      },
    ],
    forceExit: false,
  },
  metaFiles: [
    {
      pattern: "public/**",
      reloadServer: false,
    },
  ],
});
