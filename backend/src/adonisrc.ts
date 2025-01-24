import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
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
  ],

  preloads: [
    () => import("@backend/start/routes.js"),
    () => import("@backend/start/kernel.js"),
  ],

  tests: {
    suites: [
      {
        files: ["src/tests/**/*.spec.ts"],
        name: "unit",
        timeout: 2000,
      },
    ],
    forceExit: false,
  },
});
