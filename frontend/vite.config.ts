import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    nitro(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    sentryTanstackStart({
      org: "boklisten",
      project: "frontend",
      authToken: process.env["SENTRY_AUTH_TOKEN"],
    }),
  ],
});
