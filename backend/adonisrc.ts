import { indexEntities } from "@adonisjs/core";
import { defineConfig } from "@adonisjs/core/app";
import { generateRegistry } from "@tuyau/core/hooks";

export default defineConfig({
  experimental: {},
  commands: [() => import("@adonisjs/core/commands")],
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
    () => import("@adonisjs/static/static_provider"),
  ],

  preloads: [
    () => import("#start/instrument"),
    () => import("#start/routes"),
    () => import("#start/kernel"),
    () => import("#start/database"),
    () => import("#start/profiler"),
    () => import("#start/sendgrid"),
    () => import("#start/validator"),
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
  hooks: {
    init: [
      indexEntities({
        transformers: { enabled: true },
      }),
      generateRegistry(),
    ],
  },
});
